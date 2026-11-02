import { CarteLayout } from "@/features/cartes/presentation/CarteLayout"; 
import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default function CartPage() {
  	return (
		<>
			<Navbar />
			<CarteLayout />
			<Footer />
		</>
	)
}