## 🚀 Getting Started

### Prerequisites
- Docker installed (`https://docs.docker.com/get-docker/`)

## 🐳 Docker Instructions
docker build -t aetna-code-test .
docker run -d -p 3000:3000 --name aetna-code-test aetna-code-test
curl http://localhost:3000

## Testing Instructions
docker run --rm aetna-code-test npm test