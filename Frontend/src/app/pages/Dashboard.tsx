import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Search,
  LogOut,
  Plus,
  Clock,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle,
  UserPlus,
  X,
} from "lucide-react";
import { useAppContext, Estado, Prioridad } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { solicitudes, alertas, eliminarAlerta, tutores, asignarTutor, actualizarEstadoSolicitud } = useAppContext();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "Todos">("Todos");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
  const [vistaActiva, setVistaActiva] = useState<"solicitudes" | "tutores">("solicitudes");

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const coincideBusqueda =
      sol.nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.ramo.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.tutor?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === "Todos" || sol.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const estadisticas = {
    pendientes: solicitudes.filter((s) => s.estado === "Pendiente").length,
    programadas: solicitudes.filter((s) => s.estado === "Programada")
      .length,
    sinTutor: solicitudes.filter((s) => s.estado === "Buscando tutor")
      .length,
    finalizadas: solicitudes.filter((s) => s.estado === "Finalizada")
      .length,
  };

  const getEstadoBadgeVariant = (estado: Estado) => {
    const variants: Record<Estado, "default" | "secondary" | "destructive" | "outline"> = {
      Pendiente: "outline",
      "Buscando tutor": "secondary",
      "Tutor asignado": "default",
      Programada: "default",
      Finalizada: "secondary",
      Reasignación: "destructive",
      Rechazada: "destructive",
      Cancelada: "destructive",
    };
    return variants[estado];
  };

  const getPrioridadColor = (prioridad: Prioridad) => {
    const colors = {
      Alta: "text-red-500",
      Media: "text-yellow-600",
      Baja: "text-green-600",
    };
    return colors[prioridad];
  };

  const getAlertaIcon = (tipo: string) => {
    if (tipo === "urgente") return "bg-red-100 text-red-600 border-red-200";
    if (tipo === "advertencia") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-blue-100 text-blue-600 border-blue-200";
  };

  const handleVerPendientes = () => {
    setFiltroEstado("Pendiente");
  };

  const handleReasignarTutor = () => {
    setFiltroEstado("Reasignación");
  };

  const handleAsignarTutor = (solicitudId: number, tutorId: number) => {
    asignarTutor(solicitudId, tutorId);
    setSolicitudSeleccionada(null);
  };

  const handleCambiarEstado = (solicitudId: number, nuevoEstado: Estado) => {
    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    if (solicitud) {
      actualizarEstadoSolicitud(solicitudId, nuevoEstado, solicitud.tutorId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Sistema de Gestión de Tutorías</h1>
            <p className="text-sm text-muted-foreground">
              Universidad - Encargado de Tutorías
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/login-tutor")}>
              <Users className="mr-2 h-4 w-4" />
              Acceso Tutores
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={vistaActiva === "solicitudes" ? "default" : "outline"}
            onClick={() => setVistaActiva("solicitudes")}
          >
            Solicitudes
          </Button>
          <Button
            variant={vistaActiva === "tutores" ? "default" : "outline"}
            onClick={() => setVistaActiva("tutores")}
          >
            Tutores ({tutores.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            {vistaActiva === "solicitudes" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {estadisticas.pendientes}
                    </span>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    Pendientes
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {estadisticas.programadas}
                    </span>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    Programadas
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {estadisticas.sinTutor}
                    </span>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    Sin tutor
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {estadisticas.finalizadas}
                    </span>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    Finalizadas
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Tutoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por estudiante, ramo o tutor..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filtroEstado}
                      onChange={(e) =>
                        setFiltroEstado(e.target.value as Estado | "Todos")
                      }
                      className="h-9 rounded-md border border-input bg-input-background px-3 text-sm"
                    >
                      <option value="Todos">Todos los estados</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Buscando tutor">Buscando tutor</option>
                      <option value="Tutor asignado">Tutor asignado</option>
                      <option value="Programada">Programada</option>
                      <option value="Finalizada">Finalizada</option>
                      <option value="Reasignación">Reasignación</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Sem.</TableHead>
                        <TableHead>Ramo</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudesFiltradas.map((solicitud) => (
                        <TableRow key={solicitud.id}>
                          <TableCell className="font-medium">#{solicitud.id}</TableCell>
                          <TableCell className="font-medium">
                            {solicitud.nombreEstudiante}
                          </TableCell>
                          <TableCell>{solicitud.semestre}</TableCell>
                          <TableCell>{solicitud.ramo}</TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${getPrioridadColor(solicitud.prioridad)}`}
                            >
                              {solicitud.prioridad}
                            </span>
                          </TableCell>
                          <TableCell>
                            {solicitudSeleccionada === solicitud.id ? (
                              <select
                                value={solicitud.estado}
                                onChange={(e) => {
                                  handleCambiarEstado(solicitud.id, e.target.value as Estado);
                                  setSolicitudSeleccionada(null);
                                }}
                                onBlur={() => setSolicitudSeleccionada(null)}
                                className="h-8 rounded-md border border-input bg-input-background px-2 text-xs"
                                autoFocus
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Buscando tutor">Buscando tutor</option>
                                <option value="Tutor asignado">Tutor asignado</option>
                                <option value="Programada">Programada</option>
                                <option value="Finalizada">Finalizada</option>
                                <option value="Reasignación">Reasignación</option>
                                <option value="Rechazada">Rechazada</option>
                                <option value="Cancelada">Cancelada</option>
                              </select>
                            ) : (
                              <Badge
                                variant={getEstadoBadgeVariant(solicitud.estado)}
                                className="cursor-pointer"
                                onClick={() => setSolicitudSeleccionada(solicitud.id)}
                              >
                                {solicitud.estado}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {solicitud.tutor || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(solicitud.fechaSolicitud).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            {(solicitud.estado === "Pendiente" ||
                              solicitud.estado === "Buscando tutor" ||
                              solicitud.estado === "Reasignación") && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAsignarTutor(solicitud.id, parseInt(e.target.value));
                                  }
                                }}
                                className="h-8 rounded-md border border-input bg-input-background px-2 text-xs"
                                defaultValue=""
                              >
                                <option value="">Asignar tutor</option>
                                {tutores.map((tutor) => (
                                  <option key={tutor.id} value={tutor.id}>
                                    {tutor.nombre}
                                  </option>
                                ))}
                              </select>
                            )}
                            {solicitud.estado === "Tutor asignado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCambiarEstado(solicitud.id, "Programada")}
                                className="h-7 px-2 text-xs"
                              >
                                Programar
                              </Button>
                            )}
                            {solicitud.estado === "Programada" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCambiarEstado(solicitud.id, "Finalizada")}
                                className="h-7 px-2 text-xs"
                              >
                                Finalizar
                              </Button>
                            )}
                            {(solicitud.estado === "Finalizada" ||
                              solicitud.estado === "Cancelada" ||
                              solicitud.estado === "Rechazada") && "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate("/nueva-solicitud")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva solicitud
                  </Button>
                  <Button variant="outline" onClick={handleVerPendientes}>
                    <Clock className="mr-2 h-4 w-4" />
                    Ver pendientes
                  </Button>
                  <Button variant="outline" onClick={handleReasignarTutor}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reasignar tutor
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/registro-tutor")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar tutor
                  </Button>
                </div>
              </>
            )}

            {vistaActiva === "tutores" && (
              <Card>
                <CardHeader>
                  <CardTitle>Tutores Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tutores.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay tutores registrados.
                        <Button
                          variant="link"
                          onClick={() => navigate("/registro-tutor")}
                          className="ml-2"
                        >
                          Registrar el primer tutor
                        </Button>
                      </p>
                    )}
                    {tutores.map((tutor) => {
                      const tutoriasAsignadas = solicitudes.filter(
                        (s) => s.tutorId === tutor.id
                      );
                      const tutoriasCompletadas = tutoriasAsignadas.filter(
                        (s) => s.estado === "Finalizada"
                      );
                      const tutoriasProgramadas = tutoriasAsignadas.filter(
                        (s) => s.estado === "Programada" || s.estado === "Tutor asignado"
                      );

                      return (
                        <div
                          key={tutor.id}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{tutor.nombre}</h3>
                              <p className="text-sm text-muted-foreground">
                                {tutor.titulo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {tutor.email} | {tutor.telefono}
                              </p>
                            </div>
                            <Badge variant="outline">
                              Disponibilidad: {tutor.disponibilidad}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Experiencia</p>
                              <p className="text-sm font-medium">{tutor.anosExperiencia}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Programadas</p>
                              <p className="text-sm font-medium">{tutoriasProgramadas.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Completadas</p>
                              <p className="text-sm font-medium">{tutoriasCompletadas.length}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Especializaciones:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tutor.especializaciones.map((esp, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {esp}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Horarios disponibles:
                            </p>
                            <div className="space-y-1">
                              {tutor.horarios.map((horario, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs flex gap-2 bg-muted rounded px-2 py-1"
                                >
                                  <span className="font-medium">{horario.dia}</span>
                                  <span className="text-muted-foreground">
                                    {horario.horaInicio} - {horario.horaFin}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alertas.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay alertas pendientes
                  </p>
                )}
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`rounded-lg border p-3 ${getAlertaIcon(alerta.tipo)}`}
                  >
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alerta.mensaje}</p>
                        <p className="text-xs opacity-75">
                          Solicitud #{alerta.solicitudId}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarAlerta(alerta.id)}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
