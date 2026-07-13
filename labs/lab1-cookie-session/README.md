# Lab 1: Cookie Session

Lab นี้โฟกัสที่ `authentication` และการเก็บ `sessionId` ใน cookie

## Learning Goal

หลังจบ lab นี้ควรเข้าใจว่า:

- server ตรวจสอบ username/password อย่างไร
- server สร้าง session และเก็บไว้ใน memory อย่างไร
- browser หรือ client ส่ง cookie กลับมาเพื่อยืนยันตัวตนอย่างไร
- protected route ปฏิเสธ request ที่ไม่มี session ได้อย่างไร

## Endpoints

- `POST /login`
- `GET /profile`
- `POST /logout`
- `GET /debug-sessions`

## Run

```bash
npm run dev:lab1
```

Server:

```text
http://localhost:3000
```

## Demo Account

- username: `admin`
- password: `password`

## Step by Step

### 1. Start the server

เปิด terminal แล้วรัน:

```bash
npm run dev:lab1
```

เมื่อ server ทำงาน จะเห็นว่า app รันที่ `http://localhost:3000`

### 2. Try to access `/profile` without login

ลองเรียก protected route ก่อน login:

```bash
curl -i http://localhost:3000/profile
```

Expected result:

- status `401 Unauthorized`
- message: `No session cookie. Please login first.`

### 3. Login without saving cookie

ทดสอบ login แบบยังไม่เก็บ cookie:

```bash
curl -i -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

สิ่งที่ควรสังเกต:

- response สำเร็จ
- มี header `Set-Cookie`
- แต่ request ถัดไปจะยังไม่ authenticated ถ้า client ไม่ส่ง cookie กลับมา

### 4. Login and save cookie to a file

เก็บ cookie ลงไฟล์ `cookie.txt`:

```bash
curl -i -c cookie.txt -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 5. Check the saved cookie

ดูว่า `sessionId` ถูกเก็บไว้แล้ว:

```bash
cat cookie.txt
```

Expected result:

- มี cookie ชื่อ `sessionId`

### 6. Access `/profile` with the saved cookie

ส่ง cookie กลับไปพร้อม request:

```bash
curl -i -b cookie.txt http://localhost:3000/profile
```

Expected result:

- status `200 OK`
- response บอกว่า authenticated แล้ว
- มีข้อมูล user ใน session

### 7. Inspect active sessions on the server

ดูข้อมูล session ที่เก็บใน memory:

```bash
curl -i http://localhost:3000/debug-sessions
```

Expected result:

- เห็น object `sessions`
- key คือ `sessionId`
- value คือข้อมูล user และ `createdAt`

### 8. Logout using the saved cookie

ลบ session ปัจจุบัน:

```bash
curl -i -b cookie.txt -X POST http://localhost:3000/logout
```

Expected result:

- status `200 OK`
- message: `Logout successful.`

### 9. Try `/profile` again after logout

ลองเรียก route เดิมหลัง logout:

```bash
curl -i -b cookie.txt http://localhost:3000/profile
```

Expected result:

- status `401 Unauthorized`
- เพราะ session ถูกลบออกจาก server แล้ว

## Flow Summary

1. User login ด้วย username และ password
2. Server สร้าง `sessionId`
3. Server เก็บ session ไว้ใน memory
4. Server ส่ง `sessionId` กลับใน cookie
5. Client ส่ง cookie กลับมาใน request ถัดไป
6. Server ใช้ `sessionId` หา session เพื่อยืนยันตัวตน
7. Logout จะลบ session และ clear cookie

## Notes

- Lab นี้ใช้ in-memory session store เท่านั้น
- ถ้า restart server, session ทั้งหมดจะหาย
- `/debug-sessions` มีไว้เพื่อการเรียนรู้ ไม่ควรมีใน production
