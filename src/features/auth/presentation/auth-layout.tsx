import Image from "next/image";
import { Logo } from "@/shared/ui/logo";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

type Props = {
	children: React.ReactNode;
	caption: { title: string; text: string };
	imageSrc?: string;
};

export function AuthLayout({ children, caption, imageSrc }: Props) {
	return (
		<div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden  p-4 dark:from-black dark:via-gray-900 dark:to-emerald-950">
			{/* <div aria-hidden className="bg-white absolute -top-32 -left-32 -z-10 size-96 rounded-full blur-3xl" />
			<div aria-hidden className="bg-red-300 absolute -right-32 -bottom-32 -z-10 size-96 rounded-full blur-3xl" /> */}

			<div className="bg-card text-card-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/10 duration-700 lg:h-[min(720px,calc(100dvh-2rem))] lg:grid-cols-2 dark:shadow-black/50">
				<div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-10">
					<header className="flex shrink-0 items-center justify-between">
						<Logo />
						<ThemeToggle />
					</header>
					<div className="mx-auto my-auto w-full max-w-sm py-8">
						<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
						{children}
						</div>
					</div>
				</div>
				<aside className="relative isolate hidden overflow-hidden bg-neutral-900 lg:block">
					{imageSrc ? (
						<Image src={imageSrc} alt="" fill priority sizes="50vw" className="object-cover" />
					) : (
						<div aria-hidden className="from-brand absolute inset-0 bg-linear-to-br to-emerald-700" />
					)}
					<div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
					<div className="relative flex h-full flex-col justify-end p-10 text-white">
						<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 max-w-md space-y-3 delay-300 duration-1000">
						<h2 className="text-4xl leading-tight font-extrabold tracking-tight text-balance">
							{caption.title}
						</h2>
						<p className="text-base text-white/80 text-pretty">{caption.text}</p>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}