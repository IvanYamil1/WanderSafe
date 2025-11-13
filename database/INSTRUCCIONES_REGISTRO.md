# 🔧 Solución al Error de Registro de Usuarios

## 🔴 Problema

Al intentar registrar un usuario, aparece el error:
```
"viola las políticas de privacidad para la tabla user_profiles"
```

## ✅ Solución

El problema está en las políticas de **Row Level Security (RLS)** de Supabase. La solución es crear un **trigger automático** que cree el perfil del usuario cuando se registra.

---

## 📋 Pasos para Solucionar

### Paso 1: Ejecutar el SQL de Corrección en Supabase

1. **Abre tu proyecto en Supabase**: [https://supabase.com](https://supabase.com)

2. **Ve al SQL Editor** (menú lateral izquierdo)

3. **Copia y pega el contenido completo** del archivo `database/fix_rls_policies.sql`

4. **Haz clic en Run** (o presiona `Ctrl+Enter`)

### Paso 2: Verificar que el Trigger se Creó

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Deberías ver un resultado que muestra el trigger `on_auth_user_created`.

### Paso 3: Probar el Registro

1. **Reinicia tu app** (si está corriendo)
2. **Intenta registrar un nuevo usuario**
3. El perfil se creará **automáticamente** mediante el trigger

---

## 🔍 ¿Qué Hace el Fix?

### 1. **Crea una Función PostgreSQL**
```sql
handle_new_user()
```
Esta función se ejecuta automáticamente cuando un usuario se registra y crea su perfil con valores por defecto:
- `interests`: array vacío
- `preferred_budget`: 'medio'
- `language`: 'es'

### 2. **Crea un Trigger**
```sql
on_auth_user_created
```
Este trigger detecta cuando se inserta un usuario en `auth.users` y ejecuta la función `handle_new_user()`.

### 3. **Actualiza las Políticas RLS**
Las políticas se actualizan para permitir:
- ✅ Ver el propio perfil
- ✅ Actualizar el propio perfil
- ✅ Insertar un perfil si no existe uno (para el trigger)

### 4. **Actualiza el Código de la App**
El archivo `src/store/useAuthStore.ts` ya fue actualizado para:
- **Antes**: Intentaba crear el perfil manualmente (causaba error de RLS)
- **Ahora**: Espera a que el trigger cree el perfil automáticamente y luego lo obtiene

---

## 🎯 Ventajas de Esta Solución

✅ **Automático**: No necesitas código adicional en la app
✅ **Seguro**: Se ejecuta a nivel de base de datos
✅ **Consistente**: Todos los usuarios tendrán un perfil garantizado
✅ **Sin errores RLS**: El trigger se ejecuta con privilegios del sistema

---

## 🧪 Probar con Usuario Nuevo

Después de ejecutar el fix, registra un usuario de prueba:

```javascript
Email: prueba@test.com
Password: Test123456!
```

Luego verifica en Supabase que el perfil se creó:

```sql
-- Ver todos los perfiles
SELECT
  up.user_id,
  au.email,
  up.interests,
  up.preferred_budget,
  up.language,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
ORDER BY up.created_at DESC;
```

---

## 🆘 Si Aún Tienes Problemas

### Error: "relation auth.users does not exist"
**Solución**: Asegúrate de estar ejecutando el SQL en tu proyecto de Supabase, no en una base de datos local.

### Error: "trigger already exists"
**Solución**: El trigger ya existe. Puedes ignorar este error o ejecutar:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### El perfil no se crea automáticamente
**Solución**:
1. Verifica que el trigger existe (ver Paso 2 arriba)
2. Verifica los logs en Supabase > Database > Logs
3. Asegúrate de que PostGIS está habilitado

### Usuarios registrados antes del fix no tienen perfil
**Solución**: Puedes crear perfiles para usuarios existentes:
```sql
INSERT INTO user_profiles (user_id, interests, preferred_budget, language)
SELECT
  id,
  '{}',
  'medio',
  'es'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
```

---

## 📝 Resumen de Archivos Modificados

### Archivos de Base de Datos (ejecutar en Supabase)
- ✅ `database/schema.sql` - Schema original (ya ejecutado)
- ✅ `database/fix_rls_policies.sql` - **EJECUTAR ESTE para solucionar el error**

### Archivos de Código (ya modificados)
- ✅ `src/store/useAuthStore.ts` - Actualizado para usar el trigger automático

---

## 📚 Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)

---

## ✅ Checklist de Solución

- [ ] Ejecuté `fix_rls_policies.sql` en Supabase
- [ ] Verifiqué que el trigger existe
- [ ] El código de la app está actualizado (`useAuthStore.ts`)
- [ ] Probé registrar un nuevo usuario
- [ ] El perfil se creó automáticamente
- [ ] No hay errores en la consola

---

¡Listo! Después de seguir estos pasos, el registro de usuarios debería funcionar perfectamente. 🎉
