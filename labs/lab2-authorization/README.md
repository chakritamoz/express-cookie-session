# Lab 2: Authorization

Lab นี้ต่อยอดจาก cookie session แล้วเพิ่ม `authorization` ตาม role

## Learning Goal

หลังจบ lab นี้ควรเข้าใจว่า:

- user ที่ login สำเร็จ ไม่ได้แปลว่าจะเข้าถึงทุก route ได้
- `authentication` คือการยืนยันว่าเป็นใคร
- `authorization` คือการตรวจว่าสิทธิ์ของ user ทำอะไรได้บ้าง
- route ที่ต้องการ role `admin` ควรตอบ `403 Forbidden` เมื่อ user ไม่มีสิทธิ์

## Endpoints

- `POST /login`
- `GET /profile`
- `GET /admin`
- `DELETE /users`
- `POST /logout`
- `GET /debug-sessions`

## Run

```bash
npm run dev:lab2
```

Server:

```text
http://localhost:3001
```

## Demo Accounts

- `admin` / `password`
- `user` / `password`

## Step by Step

### 1. Start the server

เปิด terminal แล้วรัน:

```bash
npm run dev:lab2
```

เมื่อ server ทำงาน จะเห็นว่า app รันที่ `http://localhost:3001`

### 2. Try to access `/admin` without login

ทดสอบ route ที่ต้องมีสิทธิ์ก่อน login:

```bash
curl -i http://localhost:3001/admin
```

Expected result:

- status `401 Unauthorized`
- message: `No session cookie. Please login first.`

### 3. Login as normal user

เก็บ cookie ของ user ปกติไว้ใน `user-cookie.txt`:

```bash
curl -i -c user-cookie.txt -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"password"}'
```

### 4. Access `/profile` as normal user

ทดสอบ route ที่แค่ต้อง login:

```bash
curl -i -b user-cookie.txt http://localhost:3001/profile
```

Expected result:

- status `200 OK`
- แปลว่า user ผ่าน `authentication` แล้ว

### 5. Try to access `/admin` as normal user

ทดสอบ route ที่ต้องเป็น admin:

```bash
curl -i -b user-cookie.txt http://localhost:3001/admin
```

Expected result:

- status `403 Forbidden`
- message: `You do not have permission to access this resource.`

จุดนี้คือหัวใจของ lab:

- login สำเร็จแล้ว
- แต่ยังไม่มีสิทธิ์เข้าถึง resource นี้

### 6. Try to delete users as normal user

ลองเรียก route ที่ต้องใช้สิทธิ์ admin:

```bash
curl -i -b user-cookie.txt -X DELETE http://localhost:3001/users
```

Expected result:

- status `403 Forbidden`

### 7. Login as admin

เก็บ cookie ของ admin ไว้ใน `admin-cookie.txt`:

```bash
curl -i -c admin-cookie.txt -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 8. Access `/admin` as admin

```bash
curl -i -b admin-cookie.txt http://localhost:3001/admin
```

Expected result:

- status `200 OK`
- message: `You are authorized as admin.`

### 9. Delete users as admin

```bash
curl -i -b admin-cookie.txt -X DELETE http://localhost:3001/users
```

Expected result:

- status `200 OK`
- message: `User deleted successfully.`

หมายเหตุ:

- route นี้เป็น demo สำหรับสอน authorization
- โค้ดตัวอย่างยังไม่ได้ลบ user จริงจาก mock data

### 10. Inspect active sessions

ดู session ที่อยู่ใน memory:

```bash
curl -i http://localhost:3001/debug-sessions
```

Expected result:

- เห็น session ของ `user` และ `admin` ถ้ายังไม่ได้ logout

### 11. Logout normal user

```bash
curl -i -b user-cookie.txt -X POST http://localhost:3001/logout
```

### 12. Logout admin

```bash
curl -i -b admin-cookie.txt -X POST http://localhost:3001/logout
```

## Flow Summary

1. User login สำเร็จและได้รับ session cookie
2. `requireAuth` ใช้ cookie เพื่อตรวจว่า request นี้ login แล้วหรือยัง
3. `requireAdmin` ตรวจ role เพิ่มเติมหลังจาก authentication ผ่านแล้ว
4. user ทั่วไปเข้า `/profile` ได้ แต่เข้า `/admin` และ `DELETE /users` ไม่ได้
5. admin เข้า route ที่จำกัดสิทธิ์ได้

## Expected Status Codes

- `401 Unauthorized` เมื่อยังไม่ได้ login หรือ session ไม่ถูกต้อง
- `403 Forbidden` เมื่อ login แล้ว แต่ไม่มีสิทธิ์
- `200 OK` เมื่อทั้ง authentication และ authorization ผ่าน

## Notes

- Lab นี้ใช้ in-memory session store เท่านั้น
- ถ้า restart server, session ทั้งหมดจะหาย
- `/debug-sessions` มีไว้เพื่อการเรียนรู้ ไม่ควรมีใน production
- ระบบนี้ใช้ role แบบง่าย ๆ คือ `admin` และ `user`
