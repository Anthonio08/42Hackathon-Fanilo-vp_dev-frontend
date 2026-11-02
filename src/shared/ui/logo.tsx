import { Bitcoin } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
	return (
		<div className={`flex items-center gap-2.5 font-extrabold tracking-tight ${className}`}>
			<h1 className="text-2xl font-extrabold tracking-tight ligth:text-black">
                Fanilo<span className="text-red-600">.</span>
            </h1>
		</div>
	);
}