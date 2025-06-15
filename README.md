# DevChat

DevChat to prosty komunikator stworzony na potrzeby nauki. Projekt składa się z
frontendu opartego na React + Vite oraz backendu Express
korzystającego z PostgreSQL i Socket.IO.

## Wymagania wstępne

- Node.js w wersji **18** lub wyższej
- Zainstalowany PostgreSQL

## Instalacja zależności

```bash
# frontend
cd frontend
npm install

# backend
cd ../server
npm install
```

## Zmienne środowiskowe

Aplikacja serwerowa wykorzystuje następujące zmienne (plik `.env` w katalogu
`server`):

```bash
DB_USER=postgres
DB_PASSWORD=haslo
DB_NAME=Chat
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=sekretnyklucz
PORT=3000
```

## Uruchamianie aplikacji

W jednej konsoli uruchom backend:

```bash
cd server
npm run dev
```

W drugiej konsoli uruchom frontend:

```bash
cd frontend
npm run dev
```

## Funkcje projektu

- tworzenie nowych czatów (również grupowych)
- podstawowe awatary przy wiadomościach
- możliwość usuwania czatów
- wysyłanie i odbieranie wiadomości w czasie rzeczywistym dzięki Socket.IO

## Technologie

- **React** + **Vite** (frontend)
- **Express** (backend)
- **PostgreSQL** (baza danych)
- **Socket.IO** (komunikacja w czasie rzeczywistym)
