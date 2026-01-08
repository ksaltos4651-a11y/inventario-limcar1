#  Inventario_LimCar1

Aplicación web **Full Stack** para la gestión de inventarios de una empresa o negocio.  
Permite administrar productos, controlar stock, registrar movimientos (entradas y salidas) y manejar autenticación de usuarios.

---

##  Tecnologías utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Autenticación)
- bcryptjs (Encriptación de contraseñas)
- dotenv
- cors

### Frontend
- React (Vite)
- React Router DOM
- Axios
- CSS moderno (UI responsiva)

---

##  Estructura del proyecto

Inventario_LimCar1/
├── backend/
│ ├── src/
│ │ ├── middlewares/
│ │ ├── db.js
│ │ └── server.js
│ ├── .env
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── services/
│ │ └── App.jsx
│ └── package.json
│
└── README.md


---

##  Funcionalidades principales

- ✅ Registro y login de usuarios
- ✅ Autenticación con JWT
- ✅ CRUD de productos
- ✅ Control de stock mínimo
- ✅ Registro automático de movimientos al crear productos
- ✅ Historial de entradas y salidas
- ✅ Interfaz moderna y responsiva
- ✅ Protección de rutas

---

##  Base de datos

- **Motor:** PostgreSQL
- Tablas principales:
  - usuarios
  - productos
  - categorias
  - movimientos

El stock se controla mediante movimientos (ENTRADA / SALIDA).

---


```bash
git clone https://github.com/tu-usuario/Inventario_LimCar1.git

Configurar el Backend
cd backend
npm install

Crear archivo .env:

PORT=3000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/Inventario_LimCar1
JWT_SECRET=limcar1_secreto

Ejecutar:

npm run dev


Backend disponible en:

http://localhost:3000

Configurar el Frontend
cd frontend
npm install
npm run dev


Frontend disponible en:

http://localhost:5173

 Usuario de prueba
Cédula: 1313874651
Contraseña: 1995

Autor

Kelvin Ariel Saltos Mendoza_Quiroz Chavez Geobanny Andres
Proyecto académico – Desarrollo Web Full Stack
Año 2026

Proyecto educativo – uso académico


---

1. Abre tu repositorio en GitHub
2. Edita el `README.md`
3. Arrastra la imagen dentro del editor
4. GitHub genera automáticamente:
   ```md
   ![Login](ruta-imagen.png)
