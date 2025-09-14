import AuthHeader from "@/components/auth/auth-header";
import AuthComponent from "@/components/auth/AuthComponent";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthComponent>
            {children}
        </AuthComponent>
    )
}