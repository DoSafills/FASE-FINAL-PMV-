# Sistema de Gestión de Tutorías Académicas

Sistema desarrollado como Prototipo Mínimo Viable (PMV) para la gestión de tutorías académicas universitarias, permitiendo la coordinación entre estudiantes, tutores y administradores mediante procesos automatizados de asignación y seguimiento.

---

## Descripción General

La aplicación busca facilitar el proceso de solicitud y asignación de tutorías académicas dentro de una institución educativa.

El sistema permite que los tutores registren su disponibilidad, materias y cursos asociados, mientras que los estudiantes pueden solicitar tutorías indicando sus necesidades académicas y horarios disponibles.

Posteriormente, el sistema realiza una asignación automática considerando compatibilidad académica y horaria entre ambas partes.

---

## Objetivos del Proyecto

* Automatizar el proceso de asignación de tutorías.
* Reducir la intervención manual en la coordinación académica.
* Facilitar la gestión de disponibilidad de tutores.
* Permitir seguimiento del estado de las solicitudes.
* Mantener persistencia de información.
* Implementar un flujo operacional coherente basado en reglas de negocio reales.

---

## Funcionalidades Implementadas

### Estudiantes

* Inicio de sesión.
* Solicitud de tutorías.
* Selección de materia.
* Selección de curso.
* Selección de semestre.
* Registro de disponibilidad horaria.
* Seguimiento de solicitudes.
* Consulta de estados de tutorías.

### Tutores

* Inicio de sesión.
* Registro de disponibilidad.
* Selección de materias.
* Selección de cursos asociados.
* Gestión de horarios disponibles.
* Administración de tutorías asignadas.

### Administrador

* Supervisión general del sistema.
* Visualización de solicitudes.
* Gestión de asignaciones.
* Reasignación manual de tutorías.
* Resolución de incidencias operativas.

---

## Lógica de Asignación

El sistema realiza una búsqueda automática de tutores considerando:

* Materia solicitada.
* Curso solicitado.
* Compatibilidad de horarios.
* Coincidencia de días disponibles.
* Duración mínima de una hora.

Si existen múltiples coincidencias válidas, se selecciona al tutor con la mayor compatibilidad respecto a la solicitud realizada.

---

## Tecnologías Utilizadas

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Gestión de Estado

* React Context API

### Persistencia

* LocalStorage

### Herramientas de Desarrollo

* Node.js
* npm

---

## Estructura del Proyecto

```bash
src/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── contexts/
│
├── pages/
│
├── hooks/
│
├── services/
│
├── types/
│
├── data/
│
├── utils/
│
└── App.tsx
```

---

## Instalación

### 1. Clonar repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Ingresar al proyecto

```bash
cd nombre-del-proyecto
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

### 5. Abrir aplicación

```bash
http://localhost:5173
```

---

## Construcción para Producción

```bash
npm run build
```

---

## Persistencia de Datos

La aplicación utiliza LocalStorage para almacenar información relacionada con:

* Usuarios.
* Horarios de tutores.
* Solicitudes de tutorías.
* Estados de tutorías.
* Asignaciones realizadas.

Esto permite mantener los datos incluso después de cerrar la aplicación.

---

## Flujo General del Sistema

### 1. Tutor registra disponibilidad

* Selecciona materia.
* Selecciona cursos.
* Define días disponibles.
* Define horarios.

### 2. Estudiante genera solicitud

* Selecciona materia.
* Selecciona curso.
* Selecciona semestre.
* Define disponibilidad.

### 3. Sistema realiza asignación

* Evalúa compatibilidad académica.
* Evalúa compatibilidad horaria.
* Busca coincidencias válidas.
* Asigna automáticamente al tutor más compatible.

### 4. Seguimiento

* Solicitud enviada.
* En revisión.
* Tutor asignado.
* Programada.
* Redireccionada.
* Cancelada.
* Completada.

---

## Estado Actual del Proyecto

Actualmente el sistema implementa el flujo principal de tutorías académicas y cumple los requisitos establecidos para el Prototipo Mínimo Viable (PMV).

Se encuentran implementados:

* Persistencia de datos.
* Gestión de roles.
* Compatibilidad académica.
* Compatibilidad horaria.
* Asignación automática.
* Seguimiento de solicitudes.
* Gestión administrativa básica.

---

## Mejoras Futuras

Algunas funcionalidades consideradas para futuras versiones son:

* Validación mediante correo institucional.
* Notificaciones automáticas.
* Gestión avanzada de usuarios.
* Creación de grupos de tutorías.
* Integración con sistemas universitarios.
* Base de datos remota.
* Reportes estadísticos.
* Calendario académico integrado.

---

## Autores

Proyecto desarrollado para la asignatura de Desarrollo de apliacacione Empresarilea como parte de la construcción de un Prototipo Mínimo Viable (PMV).

---

## Licencia

Proyecto desarrollado con fines académicos.
