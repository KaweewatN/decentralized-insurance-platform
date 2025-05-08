import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Zap, Users } from "lucide-react";

export default function KeyBenefits() {
  return (
    <section id="benefits" className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Key Benefits
            </h2>
            <p className="text-muted-foreground md:text-xl">
              Why choose ChainSure for your insurance needs
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-4 text-blue-500" />
              <CardTitle>Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All policies, claims, and fund movements are recorded on the
                blockchain, providing complete transparency.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4 text-blue-500" />
              <CardTitle>Speed & Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Smart contracts automate policy issuance and claims processing,
                reducing wait times and administrative costs.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4 text-blue-500" />
              <CardTitle>Community-Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Insurance pools are created and managed by the community,
                ensuring fair terms and competitive premiums.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
