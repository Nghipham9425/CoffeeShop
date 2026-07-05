import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { processSteps, services } from "../../../data/site";

export function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge>Dịch vụ B2B</Badge>
      <h1 className="mt-4 text-5xl font-black">Giải pháp cho khách mua sỉ</h1>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Card key={service.title}>
            <CardContent>
              <service.icon className="text-[var(--leaf)]" size={34} />
              <h2 className="mt-5 text-xl font-black">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{service.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="mt-16">
        <h2 className="text-3xl font-black">Quy trình làm việc</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {processSteps.map(([title, desc], index) => (
            <Card key={title}>
              <CardContent>
                <p className="text-4xl font-black text-[var(--gold)]">0{index + 1}</p>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
