import { defineStore } from 'pinia'
import {jwtDecode} from "jwt-decode";
import type {JwtPayload} from "~/interfaces/JwtPayload";

export const useUserStore = defineStore('user', () => {
    const token = ref<null|string>(null)

    const isLoggedIn = computed(() => token.value !== null)
    const decodedJwt = computed(() => isLoggedIn.value ? jwtDecode<JwtPayload>(token.value ?? '') : null)
    const id = computed(() => decodedJwt.value?.id)
    const avatar = computed(() => decodedJwt.value?.avatar)
    const name = computed(() => decodedJwt.value?.name)

    function setToken(tokenInput: string) {
        token.value = tokenInput
    }

    function logout() {
        token.value = null
        navigateTo('/login')
    }

    return { setToken, logout, isLoggedIn, token, id, avatar, name }
}, {
    persist: true,
})