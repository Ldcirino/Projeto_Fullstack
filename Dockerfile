FROM python:3.8-slim

WORKDIR /app

# Copia dependências primeiro
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o conteúdo da pasta src diretamente para a raiz /app
COPY src/ .

EXPOSE 5000

# Variáveis para o Flask encontrar o arquivo agora que ele está na raiz /app
ENV FLASK_APP=run.py
ENV FLASK_RUN_HOST=0.0.0.0

CMD ["flask", "run"]