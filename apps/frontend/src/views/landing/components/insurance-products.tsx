import type React from "react"
import { HeartHandshake, Gauge } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProductCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}

function ProductCard({ icon, title, description, link }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="mb-2 text-[#0D47A1]">{icon}</div>
        <CardTitle className="text-xl font-semibold text-[#212529]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-[#212529]">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white"
          asChild
        >
          <Link href={link}>Learn More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function InsuranceProducts() {
  const products = [
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Health Insurance",
      description:
        "Flexible and fair health coverage with a human touch in claim reviews. Our community of experts ensures fair assessment of all health-related claims.",
      link: "/dashboard/insurance/health",
    },
    {
      icon: <Gauge className="w-8 h-8" />,
      title: "Parametric Insurance",
      description:
        "Automated payouts for events like flight delays and adverse weather, based on verifiable data. No lengthy claim process - get paid automatically when conditions are met.",
      link: "/dashboard/parametric",
    },
  ]

  return (
    <section className="py-20 bg-[#F4F6F8]">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#212529] md:text-4xl">Our Innovative Insurance Solutions</h2>
          <p className="text-lg text-[#212529]">
            Choose from our range of blockchain-powered insurance products designed for the modern world.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              icon={product.icon}
              title={product.title}
              description={product.description}
              link={product.link}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
