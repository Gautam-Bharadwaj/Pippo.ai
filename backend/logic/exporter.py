import json
import os
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black, whitesmoke
from reportlab.lib.units import inch

def generate_json_report(processed_data: List[Dict[str, Any]], metadata: Dict[str, Any]) -> str:
    '''Generates a structured JSON report from the processed contract clauses and metadata.'''
    report = {
        "generated_at": datetime.now().isoformat(),
        "metadata": metadata,
        "findings": processed_data
    }
    return json.dumps(report, indent=4)

def generate_pdf_report(processed_data: List[Dict[str, Any]], metadata: Dict[str, Any], output_path: str):
    '''Generates a professional, branded PDF report for contract analysis including ML diagnostics and math context.'''
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=30)
    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    PIPPO_PINK = HexColor('#E91E63')
    PIPPO_BLUE = HexColor('#58A6FF')
    DARK_TEXT = HexColor('#1F2328')
    GRAY_TEXT = HexColor('#484F58')
    LINE_COLOR = HexColor('#D0D7DE')

    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=26,
        textColor=PIPPO_PINK, spaceAfter=10, leading=32
    )
    subtitle_style = ParagraphStyle(
        'SubStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=10,
        textColor=GRAY_TEXT, spaceAfter=20
    )
    h2_style = ParagraphStyle(
        'H2Style', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16,
        textColor=DARK_TEXT, spaceBefore=20, spaceAfter=12
    )
    h3_style = ParagraphStyle(
        'H3Style', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=12,
        textColor=GRAY_TEXT, spaceBefore=10, spaceAfter=8
    )
    math_style = ParagraphStyle(
        'MathStyle', parent=styles['Normal'], fontName='Courier', fontSize=11,
        textColor=DARK_TEXT, alignment=1, spaceBefore=10, spaceAfter=10,
        backColor=whitesmoke, borderPadding=10
    )
    meta_label_style = ParagraphStyle(
        'MetaLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10,
        textColor=PIPPO_BLUE, spaceAfter=2
    )
    meta_val_style = ParagraphStyle(
        'MetaVal', parent=styles['Normal'], fontName='Helvetica', fontSize=11,
        textColor=DARK_TEXT, spaceAfter=10
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8,
        textColor=PIPPO_PINK, alignment=1, spaceBefore=30
    )

    story = []
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, 'assets')
    
    # Header Section
    story.append(Paragraph("Pippo AI: Strategic Legal Audit", title_style))
    story.append(Paragraph(f"Analysis Session: {datetime.now().strftime('%B %d, %Y')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PIPPO_PINK, spaceAfter=25))
    
    # 1. Contract Summary
    story.append(Paragraph("I. Contract DNA & Context", h2_style))
    story.append(Paragraph("High-level extraction of governing parameters and involved legal entities.", styles['Italic']))
    story.append(Spacer(1, 10))
    
    for key, val in metadata.items():
        display_val = ", ".join(val) if isinstance(val, list) else (val if val else "NOT DETECTED")
        story.append(Paragraph(key.replace("_", " ").upper(), meta_label_style))
        story.append(Paragraph(str(display_val), meta_val_style))
    
    # 2. Scientific Validation (NEW SECTION)
    story.append(Paragraph("II. ML Diagnostic Engine & Performance", h2_style))
    story.append(Paragraph("Theoretical context for the underlying risk assessment model.", h3_style))
    
    # LaTeX Math Notation for Gini Impurity (Random Forest)
    gini_math = "Gini Impurity (I_G) = 1 - sum(p_i^2)"
    story.append(Paragraph(gini_math, math_style))
    story.append(Paragraph("The system utilizes binary cross-entropy principles and Gini importance to rank clause anomalies.", styles['Normal']))
    
    # Load and insert Confusion Matrix
    cm_path = os.path.join(assets_dir, 'confusion_matrix.png')
    if os.path.exists(cm_path):
        story.append(Spacer(1, 10))
        img = RLImage(cm_path, width=4*inch, height=3*inch)
        story.append(img)
        story.append(Paragraph("Figure 1: Machine Learning Confusion Matrix (Test Set Validation)", styles['Italic']))
    
    # Load and insert Feature Importance
    fi_path = os.path.join(assets_dir, 'feature_importance.png')
    if os.path.exists(fi_path):
        story.append(Spacer(20, 20))
        img = RLImage(fi_path, width=4.5*inch, height=3.5*inch)
        story.append(img)
        story.append(Paragraph("Figure 2: Rank of Linguistic Tokens influencing Risk Score", styles['Italic']))

    # Metrics Table
    metrics_path = os.path.join(assets_dir, 'model_metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            m = json.load(f)
        data = [
            ['Metric', 'Value (Test Set)'],
            ['Accuracy', f"{m['accuracy']:.2%}"],
            ['Precision', f"{m['precision']:.2%}"],
            ['Recall', f"{m['recall']:.2%}"],
            ['F1-Score', f"{m['f1']:.2%}"],
            ['CV Avg Accuracy', f"{m['cv_mean']:.2%}"]
        ]
        t = Table(data, colWidths=[2*inch, 2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PIPPO_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D0D7DE')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [whitesmoke, white])
        ]))
        story.append(Spacer(1, 15))
        story.append(t)

    # 3. Detailed Audit Findings
    story.append(Paragraph("III. Clause-Level Audit Findings", h2_style))
    for i, item in enumerate(processed_data):
        risk_color = HexColor('#FF3B30') if item['is_risky'] else HexColor('#34C759')
        status = "HIGH RISK / ANOMALY" if item['is_risky'] else "NOMINAL / LOW RISK"
        
        story.append(Paragraph(f"C-{i+1:03}: {status} (Conf: {item['confidence']:.0%})", 
                               ParagraphStyle('Risk', parent=styles['Normal'], textColor=risk_color, fontName='Helvetica-Bold')))
        story.append(Paragraph(item['clause'], ParagraphStyle('Text', parent=styles['Normal'], leading=14)))
        story.append(Spacer(1, 10))

    # Footer
    story.append(Spacer(1, 40))
    story.append(Paragraph("PIPPO AI // GAUTAM BHARADWAJ SYSTEMS // RESEARCH EDITION 2026", footer_style))
    
    doc.build(story)

if __name__ == '__main__':
    generate_pdf_report([], {}, 'test.pdf')
