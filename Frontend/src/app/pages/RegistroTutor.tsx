import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export default function RegistroTutor() {
  const navigate = useNavigate();
  const { agregarTutor } = useAppContext();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    titulo: "",
    anosExperiencia: "",
    disponibilidad: "Media" as "Alta" | "Media" | "Baja",
  });

  const [especializaciones, setEspecializaciones] = useState<string[]>([]);
  const [nuevaEspecializacion, setNuevaEspecializacion] = useState("");

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState<Horario>({
    dia: "",
    horaInicio: "",
    horaFin: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const agregarEspecializacion = () => {
    if (nuevaEspecializacion.trim()) {
      setEspecializaciones([...especializaciones, nuevaEspecializacion.trim()]);
      setNuevaEspecializacion("");
    }
  };

  const eliminarEspecializacion = (index: number) => {
    setEspecializaciones(especializaciones.filter((_, i) => i !== index));
  };

  const agregarHorario = () => {
    if (nuevoHorario.dia && nuevoHorario.horaInicio && nuevoHorario.horaFin) {
      setHorarios([...horarios, nuevoHorario]);
      setNuevoHorario({ dia: "", horaInicio: "", horaFin: "" });
    }
  };

  const eliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    agregarTutor({
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      titulo: formData.titulo,
      anosExperiencia: formData.anosExperiencia,
      disponibilidad: formData.disponibilidad,
      especializaciones,
      horarios,
    });

    alert("Tutor registrado exitosamente. Ya puedes iniciar sesión.");
    navigate("/login-tutor");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
          <h1 className="text-xl font-semibold">Registro de Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Completa tu perfil para ser parte del equipo de tutores
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo *</label>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Dr. Carlos Ruiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="carlos.ruiz@universidad.cl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono *</label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 8765 4321"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Título profesional *
                  </label>
                  <Input
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Doctor en Ciencias de la Computación"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Años de experiencia *
                  </label>
                  <select
                    name="anosExperiencia"
                    value={formData.anosExperiencia}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="0-1">Menos de 1 año</option>
                    <option value="1-3">1-3 años</option>
                    <option value="3-5">3-5 años</option>
                    <option value="5-10">5-10 años</option>
                    <option value="10+">Más de 10 años</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Disponibilidad general *
                  </label>
                  <select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm"
                    required
                  >
                    <option value="Alta">Alta - Muy disponible</option>
                    <option value="Media">Media - Disponibilidad moderada</option>
                    <option value="Baja">Baja - Disponibilidad limitada</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especializaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={nuevaEspecializacion}
                  onChange={(e) => setNuevaEspecializacion(e.target.value)}
                  placeholder="Ej: Cálculo, Programación, Física..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarEspecializacion();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={agregarEspecializacion}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {especializaciones.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {especializaciones.map((esp, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {esp}
                      <button
                        type="button"
                        onClick={() => eliminarEspecializacion(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {especializaciones.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Agrega al menos una especialización
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Día</label>
                  <select
                    value={nuevoHorario.dia}
                    onChange={(e) =>
                      setNuevoHorario({ ...nuevoHorario, dia: e.target.value })
                    }
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora inicio</label>
                  <Input
                    type="time"
                    value={nuevoHorario.horaInicio}
                    onChange={(e) =>
                      setNuevoHorario({
                        ...nuevoHorario,
                        horaInicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora fin</label>
                  <Input
                    type="time"
                    value={nuevoHorario.horaFin}
                    onChange={(e) =>
                      setNuevoHorario({
                        ...nuevoHorario,
                        horaFin: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={agregarHorario}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>

              {horarios.length > 0 && (
                <div className="space-y-2 rounded-md border p-4">
                  <h4 className="text-sm font-medium">Horarios registrados:</h4>
                  <div className="space-y-2">
                    {horarios.map((horario, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-muted p-3"
                      >
                        <div className="flex gap-3 text-sm">
                          <span className="font-medium">{horario.dia}</span>
                          <span className="text-muted-foreground">
                            {horario.horaInicio} - {horario.horaFin}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarHorario(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {horarios.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Agrega al menos un horario disponible
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={especializaciones.length === 0 || horarios.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar tutor
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
