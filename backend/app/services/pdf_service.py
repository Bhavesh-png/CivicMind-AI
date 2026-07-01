from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.data import mock_data

def generate_city_pdf(report_type: str, policy_markdown: str) -> BytesIO:
    """
    Generates a beautifully styled PDF document containing city performance parameters
    and strategic recommendation details. Returns a BytesIO buffer.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette - Match UI aesthetics (Deep Blue, Cool Green, Gray background)
    primary_color = colors.HexColor("#1A365D")   # Slate Blue
    secondary_color = colors.HexColor("#0D9488") # Teal Green
    text_dark = colors.HexColor("#1F2937")       # Off-black
    bg_light = colors.HexColor("#F3F4F6")        # Light Gray
    border_color = colors.HexColor("#E5E7EB")    # Border Line Gray
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_dark,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=text_dark
    )

    story = []
    
    # --- Title & Header ---
    story.append(Paragraph(f"CivicMind AI - Executive Decision Report", title_style))
    story.append(Paragraph(f"Report Category: {report_type} Briefing | Generated: {datetime.now().strftime('%B %d, %Y, %H:%M')}", subtitle_style))
    
    # Decorative colored bar
    divider_table = Table([[""]], colWidths=[530], rowHeights=[4])
    divider_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), secondary_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(divider_table)
    story.append(Spacer(1, 15))
    
    # --- Section: Real-time Telemetry ---
    story.append(Paragraph("1. City Telemetry Summary", h1_style))
    story.append(Paragraph("Aggregated metrics across transportation, utilities, environmental, and public service databases:", body_style))
    
    # Telemetry Table
    metrics = mock_data.get_current_metrics()
    table_data = [
        [Paragraph("Sector", table_header_style), Paragraph("Key Metric", table_header_style), Paragraph("Current Value", table_header_style), Paragraph("Status", table_header_style)],
        [Paragraph("Transportation", table_cell_style), Paragraph("Congestion Percentage", table_cell_style), Paragraph(f"{metrics['traffic']['congestion_pct']}%", table_cell_style), Paragraph(metrics['traffic']['status'], table_cell_style)],
        [Paragraph("Environment", table_cell_style), Paragraph("Air Quality Index (AQI)", table_cell_style), Paragraph(f"{metrics['aqi']['value']} (PM2.5)", table_cell_style), Paragraph(metrics['aqi']['status'], table_cell_style)],
        [Paragraph("Public Health", table_cell_style), Paragraph("ICU Bed Occupancy", table_cell_style), Paragraph(f"{metrics['healthcare']['bed_occupancy_pct']}%", table_cell_style), Paragraph(metrics['healthcare']['status'], table_cell_style)],
        [Paragraph("Resource Demand", table_cell_style), Paragraph("Electrical Load", table_cell_style), Paragraph(f"{metrics['utilities']['electricity_mw']} MW", table_cell_style), Paragraph(metrics['utilities']['power_status'], table_cell_style)],
        [Paragraph("Citizen Portal", table_cell_style), Paragraph("Active Open Complaints", table_cell_style), Paragraph(str(metrics['complaints']['pending'] + metrics['complaints']['in_progress']), table_cell_style), Paragraph("Action Required", table_cell_style)]
    ]
    
    t = Table(table_data, colWidths=[120, 180, 110, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ('TOPPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # --- Section: Active Incident Registry ---
    story.append(Paragraph("2. Critical Emergency Alert Index", h1_style))
    alerts = mock_data.get_active_alerts()
    for alert in alerts:
        sev_color = "red" if alert["severity"] == "Critical" else "orange"
        alert_text = f"<b>[{alert['severity']}] {alert['title']}</b> ({alert['zone']})<br/>{alert['description']}"
        story.append(Paragraph(f"• {alert_text}", bullet_style))
    story.append(Spacer(1, 15))
    
    # --- Section: Gemini-Generated Recommendations ---
    story.append(Paragraph("3. AI Decision Framework & Strategic Recommendations", h1_style))
    
    # Process policy markdown to clean Paragraph inputs
    # For a robust PDF, we will parse basic markdown tags (headers, bold, numbered lists)
    lines = policy_markdown.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("# "):
            story.append(Paragraph(line[2:], h1_style))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:], h1_style))
        elif line.startswith("### "):
            # Subheading
            sub_style = ParagraphStyle('SubSection', parent=h1_style, fontSize=11, spaceBefore=8)
            story.append(Paragraph(line[4:], sub_style))
        elif line.startswith("- ") or line.startswith("* "):
            story.append(Paragraph(f"• {line[2:]}", bullet_style))
        elif line[0:1].isdigit() and line[1:2] == ".":
            # Numbered list
            story.append(Paragraph(f"<b>{line[0:2]}</b> {line[2:].strip()}", bullet_style))
        else:
            # Replace markdown bold with HTML bold tags
            clean_line = line.replace("**", "<b>", 1).replace("**", "</b>", 1)
            clean_line = clean_line.replace("**", "<b>").replace("**", "</b>")  # Catch remaining
            clean_line = clean_line.replace("*", "<i>").replace("*", "</i>")
            story.append(Paragraph(clean_line, body_style))
            
    story.append(Spacer(1, 20))
    
    # Signature Footer Block
    footer_data = [
        ["Authorized by:", "Platform Architect:"],
        ["City Council Representative", "CivicMind Decision Engine API"],
        ["_________________________", "_________________________"]
    ]
    f_table = Table(footer_data, colWidths=[265, 265])
    f_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TEXTCOLOR', (0,0), (-1,-1), text_dark),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Oblique'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(f_table)
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
