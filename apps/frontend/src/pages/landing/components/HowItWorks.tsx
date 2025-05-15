import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-muted/50 bg-[#F5FBFF]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How ChainSure Works
            </h2>
            <p className="text-muted-foreground md:text-xl">
              A simple, transparent process powered by smart contracts
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
          <Card className="bg-background">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary text-blue-800">
                  1
                </span>
              </div>
              <CardTitle>Browse Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore various insurance pools with different coverage options
                and terms.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary text-blue-800">
                  2
                </span>
              </div>
              <CardTitle>Get a Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive an instant premium calculation based on your specific
                needs.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary text-blue-800">
                  3
                </span>
              </div>
              <CardTitle>Purchase Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pay premium with cryptocurrency and receive your policy as an
                NFT.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary text-blue-800">
                  4
                </span>
              </div>
              <CardTitle>File Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Submit claims with evidence and receive automated payouts when
                approved.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
