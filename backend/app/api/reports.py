from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.services import gemini_service, pdf_service

router = APIRouter(prefix="/reports", tags=["AI Report Generator"])

@router.get("/preview")
async def preview_report(
    report_type: str = Query("Weekly", description="Type: Weekly, Monthly, Emergency"),
    time_frame: str = Query("Last 7 Days", description="Custom timeframe string")
):
    """
    Returns Gemini-generated policy suggestions in Markdown for previewing.
    """
    try:
        suggestions = await gemini_service.generate_policy_suggestions(report_type, time_frame)
        return {
            "report_type": report_type,
            "time_frame": time_frame,
            "policy_markdown": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report preview: {str(e)}")

@router.get("/download")
async def download_report(
    report_type: str = Query("Weekly", description="Type: Weekly, Monthly, Emergency"),
    time_frame: str = Query("Last 7 Days", description="Custom timeframe string")
):
    """
    Triggers PDF generation and returns a downloadable stream.
    """
    try:
        # Generate markdown via Gemini first
        suggestions = await gemini_service.generate_policy_suggestions(report_type, time_frame)
        
        # Build PDF bytes
        pdf_buffer = pdf_service.generate_city_pdf(report_type, suggestions)
        
        filename = f"CivicMind_{report_type.lower()}_report.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile PDF: {str(e)}")
