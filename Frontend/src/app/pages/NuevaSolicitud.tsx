import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ArrowLeft, Send, List } from "lucide-react";
import { useAppContext, Prioridad } from "../context/AppContext";

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const { agregarSolicitud } = useAppContext();
  const [formData, setFormData] = useState({
    nombreEstudiante: "",
    emailEstudiante: "",
    emailInstitucional: "",
    telefono: "",
    carrera: "",
    semestre: "",
    ramo: "",
    tema: "",
    descripcion: "",
    prioridad: "Media" as Prioridad,
    fechaPreferida: "",
    horaPreferida: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    agregarSolicitud({
      nombreEstudiante: formData.nombreEstudiante,
      emailEstudiante: formData.emailEstudiante,
      emailInstitucional: formData.emailInstitucional,
      telefono: formData.telefono,
      carrera: formData.carrera,
      semestre: parseInt(formData.semestre),
      ramo: formData.ramo,
      tema: formData.tema,
      descripcion: formData.descripcion,
      prioridad: formData.prioridad,
      fechaTutoria: formData.fechaPreferida && formData.horaPreferida
        ? `${formData.fechaPreferida} ${formData.horaPreferida}`
        : undefined,
      horaPreferida: formData.horaPreferida,
    });

    alert("Solicitud enviada exitosamente. Pronto recibirás una respuesta.");
    navigate("/mis-solicitudes");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/mis-solicitudes")}
            >
              <List className="mr-2 h-4 w-4" />
              Ver mis solicitudes
            </Button>
          </div>
          <h1 className="text-xl font-semibold">Nueva Solicitud de Tutoría</h1>
          <p className="text-sm text-muted-foreground">
            Completa el formulario para solicitar apoyo académico
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Estudiante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nombre completo *
                  </label>
                  <Input
                    name="nombreEstudiante"
                    value={formData.nombreEstudiante}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Personal *</label>
                  <Input
                    type="email"
                    name="emailEstudiante"
                    value={formData.emailEstudiante}
                    onChange={handleChange}
                    placeholder="juan.perez@gmail.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Institucional *</label>
                  <Input
                    type="email"
                    name="emailInstitucional"
                    value={formData.emailInstitucional}
                    onChange={handleChange}
                    placeholder="juan.perez@universidad.cl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Carrera *</label>
                  <Input
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleChange}
                    placeholder="Ingeniería Civil Informática"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Semestre *</label>
                  <select
                    name="semestre"
                    value={formData.semestre}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">1° Semestre</option>
                    <option value="2">2° Semestre</option>
                    <option value="3">3° Semestre</option>
                    <option value="4">4° Semestre</option>
                    <option value="5">5° Semestre</option>
                    <option value="6">6° Semestre</option>
                    <option value="7">7° Semestre</option>
                    <option value="8">8° Semestre</option>
                    <option value="9">9° Semestre</option>
                    <option value="10">10° Semestre o más</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridad *</label>
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm"
                    required
                  >
                    <option value="Baja">Baja - Tengo tiempo</option>
                    <option value="Media">Media - En 1-2 semanas</option>
                    <option value="Alta">Alta - Urgente (prueba próxima)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="font-medium">Detalles de la Tutoría</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ramo/Materia *</label>
                    <Input
                      name="ramo"
                      value={formData.ramo}
                      onChange={handleChange}
                      placeholder="Ej: Cálculo II, Programación, Física I"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tema específico *
                    </label>
                    <Input
                      name="tema"
                      value={formData.tema}
                      onChange={handleChange}
                      placeholder="Ej: Integrales, POO, Cinemática"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Descripción del problema
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe brevemente qué necesitas aprender o en qué tienes dificultades..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Fecha preferida
                    </label>
                    <Input
                      type="date"
                      name="fechaPreferida"
                      value={formData.fechaPreferida}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Hora preferida
                    </label>
                    <Input
                      type="time"
                      name="horaPreferida"
                      value={formData.horaPreferida}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar solicitud
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
