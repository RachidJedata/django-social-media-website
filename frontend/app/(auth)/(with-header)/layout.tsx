import AuthHeader from "@/components/auth/auth-header";
import AuthComponent from "@/components/auth/AuthComponent";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthComponent>
            <AuthHeader />
            <main className="pt-16"> {/* Add padding-top equal to navbar height */}
                {children}
            </main>
        </AuthComponent>
    )
}