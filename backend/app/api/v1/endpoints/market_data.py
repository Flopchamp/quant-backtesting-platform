from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import MarketDataRequest, OHLCVData
from app.services.market_data_service import MarketDataService
from typing import List

router = APIRouter()

@router.post("/", response_model=List[OHLCVData])
async def get_market_data(request: MarketDataRequest):
    try:
        service = MarketDataService()
        data = service.fetch_data(
            symbol=request.symbol,
            start_date=request.start_date,
            end_date=request.end_date,
            interval=request.interval
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
