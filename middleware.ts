import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
})

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)",'/', "/(api|trpc)(.*)"], // Applies to all dynamic routes except for static files and _next folder
}