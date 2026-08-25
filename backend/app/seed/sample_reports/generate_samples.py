import os
from pypdf import PdfWriter

def create_sample_medical_pdfs():
    os.makedirs("./uploads", exist_ok=True)
    
    # We can write sample text-layer PDFs or sample text documents
    report1_path = "./uploads/demo_lipid_report.pdf"
    report2_path = "./uploads/demo_discharge_summary.pdf"
    
    # Write a simple text representation or valid PDF placeholder
    if not os.path.exists(report1_path):
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        with open(report1_path, "wb") as f:
            writer.write(f)
            
    if not os.path.exists(report2_path):
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        with open(report2_path, "wb") as f:
            writer.write(f)

    print("Sample PDF documents ready in uploads/")

if __name__ == "__main__":
    create_sample_medical_pdfs()
