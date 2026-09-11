# sevenai — Website Replica (Integrado con Supabase, GitHub & Vercel)

Una réplica idéntica, moderna, elegante y de alto rendimiento de la web de **sevenai** ([readable-tweak-262252.framer.app/#contacto](https://readable-tweak-262252.framer.app/#contacto)).

---

## 🗄️ Configuración de Supabase (Base de datos del Formulario)

### 1. Obtener tus claves de Supabase
1. Entra a tu panel de control en **[Supabase](https://supabase.com)**.
2. Ve a **Project Settings > API**.
3. Copia dos valores:
   - **Project URL** (ejemplo: `https://xyz.supabase.co`)
   - **API Key** (`anon` / `public`)

---

### 2. Configurar las variables en el archivo `.env.local`
En la raíz de este proyecto, abre o edita el archivo `.env.local` y pega tus claves:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key-aqui
```

---

### 3. Crear la Tabla en Supabase (SQL Editor)
Ve a **SQL Editor** en Supabase, crea una nueva consulta y ejecuta este código SQL:

```sql
-- Crear tabla de contactos
CREATE TABLE contactos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  web TEXT NOT NULL,
  producto TEXT NOT NULL,
  mensaje TEXT
);

-- Habilitar permisos de inserción desde la web
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir envíos desde el formulario web" 
ON contactos FOR INSERT 
WITH CHECK (true);
```

¡Listo! Cada vez que alguien complete el formulario en la web, la información de `nombre`, `email`, `web`, `producto` y `mensaje` se guardará automáticamente en tu tabla `contactos` de Supabase.

---

## 🚀 Despliegue en 3 pasos (GitHub & Vercel)

### 1. Probar en Local
```bash
npm install
npm run dev
```

---

### 2. Subir a GitHub
```bash
git init
git add .
git commit -m "Integración completa de formulario con Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

---

### 3. Publicar en Vercel con Variables de Entorno
1. Importa tu repositorio en **[Vercel](https://vercel.com)**.
2. En la sección **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `tu-anon-public-key`
3. Haz clic en **Deploy**.
