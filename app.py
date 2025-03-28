from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

app = Flask(__name__, static_folder="frontend/build", static_url_path="")
CORS(app)

# ✅ Serve React frontend
@app.route("/")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

# ✅ Function to generate a PDF
def create_pdf(title, text):
    filename = f"{title.replace(' ', '_')}.pdf"
    pdf_path = os.path.join("pdfs", filename)

    os.makedirs("pdfs", exist_ok=True)

    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    # ✅ Title on the first page
    c.setFont("Helvetica-Bold", 16)
    c.drawString(150, height - 50, title)

    # ✅ Setup for text content
    c.setFont("Helvetica", 12)
    y_position = height - 100  # Start text below the title
    line_height = 20  # Space between lines

    # ✅ Split text into lines and handle multiple pages
    lines = text.split("\n")
    for line in lines:
        if y_position < 50:  # If not enough space, create a new page
            c.showPage()
            c.setFont("Helvetica", 12)
            y_position = height - 50  # Reset position on new page

        c.drawString(100, y_position, line)
        y_position -= line_height

    c.save()
    return pdf_path

# ✅ API Route to Generate PDF
@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        title = request.form.get("title")
        file = request.files.get("file")

        if not title or not file:
            return jsonify({"error": "Missing title or file"}), 400

        if file.filename.split(".")[-1] != "txt":
            return jsonify({"error": "Invalid file type. Only .txt files are allowed."}), 400

        text = file.read().decode("utf-8")  # ✅ Read file content

        pdf_path = create_pdf(title, text)
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

