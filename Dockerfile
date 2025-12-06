# Gunakan Python versi ringan
FROM python:3.9-slim

# Set folder kerja
WORKDIR /app

# Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh folder api ke dalam container
COPY api/ ./api/

# Expose port (Render menggunakan variable PORT)
ENV PORT=8000

# Jalankan aplikasi (Arahkan ke api.index:app)
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]