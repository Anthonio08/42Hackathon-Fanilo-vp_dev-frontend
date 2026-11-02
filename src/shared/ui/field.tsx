"use client";

import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "cn";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const inputClass =
  	"h-11 rounded-full bg-background/60 px-4 shadow-xs transition outline-none focus-visible:ring-0 focus-visible:border-brand";
const iconClass =
  	"text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2";

type BaseProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
	label: string;
	error?: string;
	hint?: string;
	id?: string;
};

function FieldShell({
	id,
	label,
	error,
	hint,
	children,
}: {
  id: string;
	label: string;
	error?: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="text-sm font-medium">
				{label}
			</Label>
			{children}
			{error ? (
				<p id={`${id}-error`} role="alert" className="text-destructive text-sm">
					{error}
				</p>
			) : hint ? (
				<p id={`${id}-hint`} className="text-muted-foreground text-xs">
					{hint}
				</p>
			) : null}
		</div>
	);
}

function a11y(id: string, error?: string, hint?: string) {
	return {
		"aria-invalid": !!error,
		"aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
	};
}

type TextFieldProps = BaseProps & { icon?: LucideIcon };

export function TextField({ id, label, error, hint, icon: Icon, className, ...props }: TextFieldProps) {
	const auto = useId();
	const fieldId = id ?? auto;

	return (
		<FieldShell id={fieldId} label={label} error={error} hint={hint}>
			<div className="relative">
				{Icon && <Icon className={iconClass} />}
				<Input
					id={fieldId}
					className={cn(inputClass, Icon && "pl-10", className)}
					{...a11y(fieldId, error, hint)}
					{...props}
				/>
			</div>
		</FieldShell>
	);
}

export function PasswordField({ id, label, error, hint, className, ...props }: BaseProps) {
	const auto = useId();
	const fieldId = id ?? auto;
	const [visible, setVisible] = useState(false);

	return (
		<FieldShell id={fieldId} label={label} error={error} hint={hint}>
			<div className="relative">
				<Lock className={iconClass} />
				<Input
					id={fieldId}
					type={visible ? "text" : "password"}
					className={cn(inputClass, "pr-11 pl-10", className)}
					{...a11y(fieldId, error, hint)}
					{...props}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
					aria-pressed={visible}
					className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition"
				>
					{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
				</button>
			</div>
		</FieldShell>
	);
}