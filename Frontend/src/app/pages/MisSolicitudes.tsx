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
  ArrowLeft,
  Search,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAppContext, Estado } from "../context/AppContext";

const descripcionEstados: Record<Estado, string> = {
  Pendiente: "Tu solicitud ha sido recibida y está esperando revisión por parte del administrador.",
  "Buscando tutor": "Estamos buscando un tutor disponible que se ajuste a tus necesidades.",
  "Tutor asignado": "Se ha asignado un tutor a tu solicitud. Pronto recibirás confirmación de la fecha.",
  Programada: "Tu tutoría ha sido programada. Revisa la fecha y hora asignada.",
  Finalizada: "La tutoría se ha completado. Puedes ver el registro de asistencia.",
  Reasignación: "Estamos buscando un nuevo tutor para tu solicitud debido a disponibilidad.",
  Rechazada: "La solicitud fue rechazada por el tutor. Se asignará otro tutor automáticamente.",
  Cancelada: "La tutoría ha sido cancelada.",
};

export default function MisSolicitudes() {
  const navigate = useNavigate();
  const { solicitudes } = useAppContext();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "Todos">("Todos");
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const coincideBusqueda =
      sol.ramo.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.tema.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.tutor?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === "Todos" || sol.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const estadisticas = {
    total: solicitudes.length,
    pendientes:
      solicitudes.filter(
        (s) => s.estado === "Pendiente" || s.estado === "Buscando tutor"
      ).length,
    programadas: solicitudes.filter((s) => s.estado === "Programada")
      .length,
    completadas: solicitudes.filter((s) => s.estado === "Finalizada")
      .length,
    asistidas: solicitudes.filter(
      (s) => s.estado === "Finalizada" && s.asistio === true
    ).length,
    faltaron: solicitudes.filter(
      (s) => s.estado === "Finalizada" && s.asistio === false
    ).length,
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/nueva-solicitud")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Mis Solicitudes de Tutoría</h1>
              <p className="text-sm text-muted-foreground">
                Revisa el estado y historial de tus solicitudes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarAyuda(!mostrarAyuda)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              ¿Qué significa cada estado?
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {mostrarAyuda && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Significado de los Estados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(descripcionEstados).map(([estado, descripcion]) => (
                <div key={estado} className="flex gap-3">
                  <Badge variant={getEstadoBadgeVariant(estado as Estado)} className="shrink-0">
                    {estado}
                  </Badge>
                  <p className="text-sm text-blue-900">{descripcion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{estadisticas.total}</span>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{estadisticas.pendientes}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{estadisticas.programadas}</span>
              </div>
              <p className="text-sm text-muted-foreground">Programadas</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{estadisticas.completadas}</span>
              </div>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {estadisticas.asistidas}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Asistí</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  {estadisticas.faltaron}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Falté</p>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ramo, tema o tutor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                <option value="Rechazada">Rechazada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ramo</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Fecha Tutoría</TableHead>
                    <TableHead>Asistencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudesFiltradas.map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">#{solicitud.id}</TableCell>
                      <TableCell>{solicitud.ramo}</TableCell>
                      <TableCell className="max-w-xs truncate">{solicitud.tema}</TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                          {solicitud.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {solicitud.tutor || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {solicitud.fechaTutoria || "—"}
                      </TableCell>
                      <TableCell>
                        {solicitud.asistio === true && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Asistí
                          </Badge>
                        )}
                        {solicitud.asistio === false && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Falté
                          </Badge>
                        )}
                        {solicitud.asistio === undefined && "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
