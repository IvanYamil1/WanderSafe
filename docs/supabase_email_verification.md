# Configuración de Verificación de Correo en Supabase

## Habilitar verificación de correo electrónico

Para que los usuarios reciban un correo de verificación al registrarse, sigue estos pasos:

### 1. Ir a Authentication Settings
1. Abre tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Settings** en el menú lateral

### 2. Configurar Email Confirmation
1. Busca la sección **Email Auth**
2. Asegúrate de que **Enable email confirmations** esté activado
3. Si no lo está, actívalo y guarda los cambios

### 3. Configurar Email Templates (Opcional)
1. Ve a **Authentication** → **Email Templates**
2. Personaliza el template "Confirm signup" si deseas
3. Puedes cambiar el texto, agregar tu logo, etc.

### 4. Configurar Redirect URLs
1. En **Authentication** → **URL Configuration**
2. Agrega las URLs de redirección permitidas:
   - Para desarrollo: `exp://localhost:8081`
   - Para producción: Tu URL de deep linking

### 5. Verificar que funciona
1. Registra un nuevo usuario en la app
2. Verifica que recibas el correo de verificación
3. Haz clic en el enlace del correo
4. Intenta iniciar sesión con las credenciales

## Notas importantes:

- Los usuarios NO podrán iniciar sesión hasta que verifiquen su correo
- Si intentan iniciar sesión sin verificar, recibirán un error
- El perfil del usuario se crea automáticamente cuando verifican su correo (gracias al trigger de la BD)
- Puedes ver el estado de verificación de usuarios en **Authentication** → **Users**

## Solución de problemas:

### El correo no llega
1. Revisa la carpeta de spam
2. Verifica que el email esté configurado correctamente en Supabase
3. Considera configurar un proveedor de email personalizado (SendGrid, etc.)

### El usuario ya se registró pero no verificó
1. Ve a **Authentication** → **Users** en Supabase
2. Encuentra al usuario
3. Puedes enviarlo manualmente desde el panel o eliminar la cuenta para que se registre de nuevo
