# Floor Plan POC

A standalone proof of concept of the clinic floor plan from medi-doc. It has a live board showing where patients are, a builder for editing the layout, and a small scheduling backend so you can book a patient and then place them on the map.

```
floor-plan-poc/
  server/   NestJS 11 + Mongoose + Swagger   (http://localhost:3000/api, docs at /api/docs)
  client/   Vite + React 19 + TypeScript + MUI 7 + Redux Toolkit   (http://localhost:5173)
```

## Prerequisites
- Node 20 or newer
- MongoDB running locally (`mongod`), or any MongoDB URI

## Run it

```bash
# 1. API
cd server
cp .env.example .env        # edit MONGODB_URI if needed
npm install
npm run seed                # 8 patients, today's schedules (+3 tomorrow); statuses and staff self-seed on start
npm run start:dev           # http://localhost:3000/api/docs

# 2. Web app (second terminal)
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                 # http://localhost:5173
```

On first open with an empty database the client loads the built-in **Small Clinic** template and saves it as the floor plan. `npm run seed -- --reset` also clears the saved plan, so the template is loaded again next time.

## Pages
| Route | What it does |
|---|---|
| `/` | Live board for the selected day: floor plan, "Not seen" sidebar, room and bed panels. Drag a patient onto a room or bed to place them; their schedule status follows the room's "assign status". **Add schedule** books a patient (existing or new) and they appear in the sidebar straight away. Click a patient card to edit or cancel their booking. |
| `/builder` | Floor plan editor: walls, rooms, doors, furniture, beds, labels, floors, templates, undo/redo. Save writes the layout to the API. |
| `/schedules` | Table of the day's schedules with inline status change, edit and delete. |

The selected day is kept in the URL (`?date=YYYY-MM-DD`) so it carries across pages.

## API (summary — full schemas in Swagger)
| Endpoint | Purpose |
|---|---|
| `GET/PUT /api/floor-plan` | The layout (floors, walls, doors, rooms with furniture, labels, custom room types) |
| `GET/PUT /api/floor-plan/live` | Patient placements and room/bed state. `PUT` merges by default |
| `GET/POST/PUT/DELETE /api/templates` | Published floor templates (built-ins live in the client) |
| `GET/POST/PATCH/DELETE /api/patients` | Patients, `?search=` matches name or PHN |
| `GET /api/schedules?from=&to=` | Schedules as board events |
| `POST/PATCH/DELETE /api/schedules/:id` | Book, edit, cancel |
| `PATCH /api/schedules/:id/status` | Status change (what the board calls on drop) |
| `GET /api/statuses`, `GET/POST /api/staff` | Status list, doctors and nurses |

## Notes
- No auth and a single clinic: there is one floor plan document and one live-state document.
- The layout is also cached in `localStorage` (`floor-plan-poc:layout`). If a save fails, the change stays on this device, and on the next load you're asked whether to keep it or take the server copy.
- Type-check either project with `npm run typecheck`.
