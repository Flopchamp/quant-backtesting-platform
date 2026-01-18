from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User as UserModel, Strategy as StrategyModel
from app.schemas.schemas import Strategy, StrategyCreate, StrategyUpdate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=Strategy, status_code=status.HTTP_201_CREATED)
def create_strategy(
    strategy: StrategyCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_strategy = StrategyModel(**strategy.dict(), user_id=current_user.id)
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

@router.get("/", response_model=List[Strategy])
def list_strategies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    strategies = db.query(StrategyModel).filter(
        StrategyModel.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return strategies

@router.get("/{strategy_id}", response_model=Strategy)
def get_strategy(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    strategy = db.query(StrategyModel).filter(
        StrategyModel.id == strategy_id,
        StrategyModel.user_id == current_user.id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy

@router.put("/{strategy_id}", response_model=Strategy)
def update_strategy(
    strategy_id: int,
    strategy_update: StrategyUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_strategy = db.query(StrategyModel).filter(
        StrategyModel.id == strategy_id,
        StrategyModel.user_id == current_user.id
    ).first()
    if not db_strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    update_data = strategy_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_strategy, field, value)
    
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_strategy(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_strategy = db.query(StrategyModel).filter(
        StrategyModel.id == strategy_id,
        StrategyModel.user_id == current_user.id
    ).first()
    if not db_strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    db.delete(db_strategy)
    db.commit()
    return None
