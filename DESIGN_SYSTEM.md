# 🎨 WanderSafe Design System

Sistema de diseño profesional y moderno para la aplicación WanderSafe.

---

## ✨ ¿Qué se ha mejorado?

### 1. **Sistema de Tema Centralizado**
Ahora todos los colores, tipografía, espaciados y sombras están centralizados en `src/theme/`

### 2. **Componentes UI Reutilizables**
Componentes profesionales listos para usar: `Button`, `Card`, `Input`, `Text`

### 3. **Estilos Mejorados**
- Pantallas de autenticación completamente rediseñadas
- Componentes PlaceCard con badges de categoría coloridos
- Mejores sombras y elevaciones
- Animaciones y transiciones suaves

---

## 📁 Estructura del Sistema de Diseño

```
src/
├── theme/
│   ├── colors.ts          # Paleta de colores completa
│   ├── typography.ts      # Sistema tipográfico
│   ├── spacing.ts         # Espaciados consistentes
│   ├── shadows.ts         # Sombras y elevaciones
│   ├── radius.ts          # Border radius
│   └── index.ts           # Exportación central
│
└── components/
    └── ui/
        ├── Button.tsx     # Componente de botón
        ├── Card.tsx       # Componente de tarjeta
        ├── Input.tsx      # Componente de input
        ├── Text.tsx       # Componente de texto
        └── index.ts       # Exportaciones
```

---

## 🎨 Paleta de Colores

### **Colores Primarios**
```typescript
colors.primary[500]  // #2196F3 - Azul principal
colors.secondary[500] // #FF9800 - Naranja cálido
```

### **Colores Neutros**
```typescript
colors.neutral[0]    // #FFFFFF - Blanco
colors.neutral[100]  // #F5F5F5 - Gris muy claro
colors.neutral[500]  // #9E9E9E - Gris medio
colors.neutral[900]  // #212121 - Negro suave
```

### **Colores Semánticos**
```typescript
colors.success.main  // #4CAF50 - Verde
colors.warning.main  // #FFC107 - Amarillo
colors.error.main    // #F44336 - Rojo
colors.info.main     // #2196F3 - Azul
```

### **Colores de Categorías**
Cada categoría de lugar tiene su color único:
```typescript
colors.category.restaurante  // #FF5722
colors.category.museo        // #9C27B0
colors.category.parque       // #4CAF50
colors.category.bar          // #E91E63
// ... y más
```

### **Acceso Rápido**
```typescript
import { COLORS } from '@/theme';

COLORS.PRIMARY     // Azul principal
COLORS.SUCCESS     // Verde
COLORS.ERROR       // Rojo
COLORS.WHITE       // Blanco
COLORS.BLACK       // Negro
```

---

## 📝 Tipografía

### **Variantes de Texto**

```typescript
import { Text } from '@/components/ui';

// Displays (títulos grandes)
<Text variant="displayLarge">48px</Text>
<Text variant="displayMedium">36px</Text>
<Text variant="displaySmall">32px</Text>

// Headings
<Text variant="h1">32px</Text>
<Text variant="h2">28px</Text>
<Text variant="h3">24px</Text>
<Text variant="h4">20px</Text>
<Text variant="h5">18px</Text>
<Text variant="h6">16px</Text>

// Body
<Text variant="bodyLarge">18px</Text>
<Text variant="body">16px</Text>        // Default
<Text variant="bodySmall">14px</Text>

// Labels
<Text variant="labelLarge">16px</Text>
<Text variant="label">14px</Text>
<Text variant="labelSmall">12px</Text>

// Caption y especiales
<Text variant="caption">12px</Text>
<Text variant="button">16px</Text>
<Text variant="overline">12px</Text>
```

### **Colores de Texto**
```typescript
<Text color="primary">Texto principal</Text>
<Text color="secondary">Texto secundario</Text>
<Text color="tertiary">Texto terciario</Text>
<Text color="inverse">Texto inverso (blanco)</Text>
<Text color="link">Enlace</Text>
<Text color="error">Error</Text>
<Text color="success">Éxito</Text>
```

### **Modificadores**
```typescript
<Text bold>Texto en negrita</Text>
<Text center>Texto centrado</Text>
<Text variant="h3" color="primary" bold center>
  Combinado
</Text>
```

---

## 🔘 Botones

### **Variantes**

```typescript
import { Button } from '@/components/ui';

// Primario (azul sólido)
<Button variant="primary">
  Botón Principal
</Button>

// Secundario (naranja sólido)
<Button variant="secondary">
  Botón Secundario
</Button>

// Outline (borde azul, fondo transparente)
<Button variant="outline">
  Botón Outline
</Button>

// Ghost (sin fondo ni borde)
<Button variant="ghost">
  Botón Ghost
</Button>

// Danger (rojo, para acciones destructivas)
<Button variant="danger">
  Eliminar
</Button>
```

### **Tamaños**
```typescript
<Button size="small">Pequeño (40px)</Button>
<Button size="medium">Mediano (48px)</Button>  // Default
<Button size="large">Grande (56px)</Button>
```

### **Con Iconos**
```typescript
// Icono a la izquierda
<Button icon="log-in-outline">
  Iniciar Sesión
</Button>

// Icono a la derecha
<Button icon="arrow-forward" iconPosition="right">
  Continuar
</Button>
```

### **Estados y Modificadores**
```typescript
// Loading
<Button loading>Cargando...</Button>

// Disabled
<Button disabled>Deshabilitado</Button>

// Ancho completo
<Button fullWidth>Botón Completo</Button>

// Combinado
<Button
  variant="primary"
  size="large"
  icon="save"
  loading={isLoading}
  fullWidth
>
  Guardar
</Button>
```

---

## 🎴 Cards

### **Variantes**

```typescript
import { Card } from '@/components/ui';

// Elevada (con sombra) - Default
<Card variant="elevated">
  <Text>Contenido con sombra</Text>
</Card>

// Outlined (con borde)
<Card variant="outlined">
  <Text>Contenido con borde</Text>
</Card>

// Filled (fondo gris)
<Card variant="filled">
  <Text>Contenido con fondo</Text>
</Card>
```

### **Padding Personalizado**
```typescript
<Card padding={4}>16px de padding</Card>
<Card padding={6}>24px de padding</Card>
<Card padding={0}>Sin padding</Card>
```

### **Card Interactiva**
```typescript
<Card onPress={() => console.log('Presionado')}>
  <Text>Card clickeable</Text>
</Card>
```

---

## 📥 Inputs

### **Input Básico**

```typescript
import { Input } from '@/components/ui';

<Input
  label="Correo electrónico"
  placeholder="tu@email.com"
  value={email}
  onChangeText={setEmail}
/>
```

### **Con Iconos**
```typescript
// Icono izquierdo
<Input
  label="Email"
  placeholder="tu@email.com"
  leftIcon="mail-outline"
  value={email}
  onChangeText={setEmail}
/>

// Icono derecho (clickeable)
<Input
  label="Contraseña"
  placeholder="••••••••"
  secureTextEntry={!showPassword}
  leftIcon="lock-closed-outline"
  rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
  onRightIconPress={() => setShowPassword(!showPassword)}
  value={password}
  onChangeText={setPassword}
/>
```

### **Variantes**
```typescript
// Filled (con fondo) - Default
<Input variant="filled" />

// Outlined (con borde)
<Input variant="outlined" />
```

### **Tamaños**
```typescript
<Input size="small" />   // 40px
<Input size="medium" />  // 48px (default)
<Input size="large" />   // 56px
```

### **Estados**
```typescript
// Con error
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error="Email inválido"
/>

// Con helper text
<Input
  label="Contraseña"
  value={password}
  onChangeText={setPassword}
  helperText="Mínimo 8 caracteres"
/>
```

---

## 📏 Espaciado

### **Sistema de Espaciado (8-point grid)**

```typescript
import { spacing } from '@/theme';

spacing[0]   // 0px
spacing[1]   // 4px
spacing[2]   // 8px
spacing[3]   // 12px
spacing[4]   // 16px
spacing[5]   // 20px
spacing[6]   // 24px
spacing[8]   // 32px
spacing[10]  // 40px
spacing[12]  // 48px
```

### **Espaciados Semánticos**
```typescript
import { margins, padding, gap } from '@/theme';

// Margins
margins.xs   // 4px
margins.sm   // 8px
margins.md   // 16px
margins.lg   // 24px
margins.xl   // 32px

// Lo mismo para padding y gap
```

### **Uso en Estilos**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: spacing[6],          // 24px
    marginBottom: spacing[4],     // 16px
    gap: spacing[3],              // 12px
  },
});
```

---

## 🌗 Sombras

### **Niveles de Elevación**

```typescript
import { shadows } from '@/theme';

const styles = StyleSheet.create({
  card: {
    ...shadows.none,   // Sin sombra
    ...shadows.sm,     // Sombra pequeña
    ...shadows.base,   // Sombra base
    ...shadows.md,     // Sombra media (default)
    ...shadows.lg,     // Sombra grande
    ...shadows.xl,     // Sombra extra grande
    ...shadows['2xl'], // Sombra máxima
  },
});
```

---

## 🔘 Border Radius

```typescript
import { radius, shapes } from '@/theme';

// Radius específicos
radius.none   // 0px
radius.xs     // 4px
radius.sm     // 8px
radius.md     // 12px
radius.lg     // 16px
radius.xl     // 20px
radius['2xl'] // 24px
radius['3xl'] // 32px
radius.full   // 9999px (círculo/pill)

// Shapes predefinidos
shapes.button    // 12px
shapes.card      // 16px
shapes.input     // 12px
shapes.modal     // 20px
shapes.chip      // 9999px
shapes.avatar    // 9999px
```

---

## 🎯 Ejemplos de Uso

### **LoginScreen Mejorado**

```typescript
import { Button, Input, Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';

<View style={styles.container}>
  <Text variant="h2" style={{ marginBottom: spacing[2] }}>
    Bienvenido
  </Text>
  <Text variant="body" color="secondary" style={{ marginBottom: spacing[8] }}>
    Inicia sesión para continuar
  </Text>

  <Input
    label="Correo electrónico"
    placeholder="tu@email.com"
    leftIcon="mail-outline"
    value={email}
    onChangeText={setEmail}
  />

  <Input
    label="Contraseña"
    placeholder="••••••••"
    secureTextEntry
    leftIcon="lock-closed-outline"
    value={password}
    onChangeText={setPassword}
  />

  <Button
    variant="primary"
    size="large"
    icon="log-in-outline"
    fullWidth
    loading={isLoading}
    onPress={handleLogin}
  >
    Iniciar Sesión
  </Button>
</View>
```

### **PlaceCard Mejorado**

```typescript
import { Card, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

<Card variant="elevated" padding={0} onPress={onPress}>
  <Image source={{ uri: place.image }} style={styles.image} />

  <View style={{ padding: spacing[4] }}>
    <Text variant="h6" numberOfLines={1}>
      {place.name}
    </Text>

    <View style={styles.categoryBadge}>
      <Icon name="restaurant" size={12} color={colors.category.restaurante} />
      <Text variant="caption" style={{ color: colors.category.restaurante }}>
        {place.category}
      </Text>
    </View>

    <View style={styles.footer}>
      <View style={styles.rating}>
        <Icon name="star" size={16} color={colors.special.rating} />
        <Text variant="labelLarge">{place.rating}</Text>
      </View>
      <Text variant="labelLarge" bold>{place.price}</Text>
    </View>
  </View>
</Card>
```

---

## 🚀 Cómo Migrar Componentes Existentes

### **1. Importar el Tema**

```typescript
// Antes
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
});

// Después
import { colors, spacing, radius } from '@/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary[500],
    padding: spacing[4],
    borderRadius: radius.md,
  },
});
```

### **2. Usar Componentes UI**

```typescript
// Antes
<TouchableOpacity style={styles.button} onPress={onPress}>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>

// Después
import { Button } from '@/components/ui';

<Button variant="primary" onPress={onPress}>
  Click me
</Button>
```

### **3. Reemplazar Text**

```typescript
// Antes
<Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' }}>
  Título
</Text>

// Después
import { Text } from '@/components/ui';

<Text variant="h3">
  Título
</Text>
```

---

## 📱 Screens Actualizadas

### ✅ **Ya Mejoradas**
- ✅ `LoginScreen` - Usa Button, Input, Text y nuevo tema
- ✅ `PlaceCard` - Usa Card, Text y categorías coloridas

### 🔄 **Pendientes de Actualizar**
- RegisterScreen
- HomeScreen
- ExploreScreen
- ProfileScreen
- PlaceDetailsScreen
- CategoryFilter
- Y demás pantallas...

---

## 🎨 Guía de Estilos

### **DO's ✅**

1. **Usar componentes UI** en lugar de crear propios
   ```typescript
   ✅ <Button variant="primary">Save</Button>
   ❌ <TouchableOpacity style={{backgroundColor: '#007AFF'}}>...</TouchableOpacity>
   ```

2. **Usar valores del tema** en lugar de hardcodear
   ```typescript
   ✅ backgroundColor: colors.primary[500]
   ❌ backgroundColor: '#2196F3'
   ```

3. **Usar espaciado consistente**
   ```typescript
   ✅ padding: spacing[4]
   ❌ padding: 15
   ```

4. **Usar variantes de Text**
   ```typescript
   ✅ <Text variant="h3">Title</Text>
   ❌ <Text style={{fontSize: 24, fontWeight: 'bold'}}>Title</Text>
   ```

### **DON'Ts ❌**

1. ❌ No hardcodear colores: `backgroundColor: '#FF0000'`
2. ❌ No usar espaciados arbitrarios: `margin: 13`
3. ❌ No crear botones custom si puede usar `<Button>`
4. ❌ No duplicar estilos entre componentes

---

## 🎯 Beneficios del Sistema de Diseño

1. ✅ **Consistencia**: Todos los componentes siguen el mismo estilo
2. ✅ **Mantenibilidad**: Cambios centralizados afectan toda la app
3. ✅ **Productividad**: Menos tiempo escribiendo estilos
4. ✅ **Profesionalismo**: App se ve pulida y moderna
5. ✅ **Escalabilidad**: Fácil agregar nuevos componentes
6. ✅ **Accesibilidad**: Colores y tamaños optimizados
7. ✅ **Dark Mode Ready**: Preparado para tema oscuro

---

## 🔧 Personalización

### **Cambiar Color Primario**

Edita `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: {
    // ... cambia todos los tonos
    500: '#TU_COLOR_AQUI',
  },
};
```

### **Agregar Nueva Variante de Botón**

Edita `src/components/ui/Button.tsx`:

```typescript
// Agregar al type
type ButtonVariant = 'primary' | 'secondary' | 'tu_variante';

// Agregar estilos
const styles = StyleSheet.create({
  // ...
  tu_variante: {
    backgroundColor: colors.tu_color,
  },
  text_tu_variante: {
    color: colors.otro_color,
  },
});
```

---

## 📚 Recursos

- [Material Design 3](https://m3.material.io/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [React Native Paper](https://reactnativepaper.com/)

---

¡Ahora tu app WanderSafe tiene un sistema de diseño profesional! 🎉

Para cualquier duda sobre cómo usar un componente, revisa los ejemplos en este documento o los archivos en `src/components/ui/`.
