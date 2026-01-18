from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.models import User as UserModel, Backtest as BacktestModel, Strategy as StrategyModel
from app.schemas.schemas import BacktestCreate, BacktestResult
from app.api.v1.endpoints.auth import get_current_user
from app.services.backtesting_engine import run_backtest

router = APIRouter()

@router.post("/", response_model=BacktestResult, status_code=status.HTTP_201_CREATED)
def create_backtest(
    backtest: BacktestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Verify strategy exists and belongs to user
    strategy = db.query(StrategyModel).filter(
        StrategyModel.id == backtest.strategy_id,
        StrategyModel.user_id == current_user.id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    # Create backtest record
    db_backtest = BacktestModel(
        strategy_id=backtest.strategy_id,
        user_id=current_user.id,
        start_date=backtest.start_date,
        end_date=backtest.end_date,
        status="pending"
    )
    db.add(db_backtest)
    db.commit()
    db.refresh(db_backtest)
    
    # Run backtest in background
    background_tasks.add_task(run_backtest, db_backtest.id)
    
    return db_backtest

@router.get("/", response_model=List[BacktestResult])
def list_backtests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    backtests = db.query(BacktestModel).filter(
        BacktestModel.user_id == current_user.id
    ).order_by(BacktestModel.created_at.desc()).offset(skip).limit(limit).all()
    return backtests

@router.get("/{backtest_id}", response_model=BacktestResult)
def get_backtest(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    backtest = db.query(BacktestModel).filter(
        BacktestModel.id == backtest_id,
        BacktestModel.user_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return backtest

@router.delete("/{backtest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_backtest(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    backtest = db.query(BacktestModel).filter(
        BacktestModel.id == backtest_id,
        BacktestModel.user_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    
    db.delete(backtest)
    db.commit()
    return None
