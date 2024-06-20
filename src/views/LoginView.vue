<template>
    <div class="login">
        <img class="logo" src="../assets/logo.png" alt="">
        <div class="login-box">
            <span class="title">Login</span>
            <InputField label="Username" v-model="username" type="text" />
            <InputField label="Password" v-model="password" type="password" />
            <button class="login-btn" @click="Login">Login</button>
        </div>
        <div class="footer">
            <span>Don't have an account?</span>
            <span class="contact">Contact Local Agents</span>
        </div>
    </div>
</template>

<script>
import InputField from '../components/inputField.vue';
import AuthService from '../services/authService';
export default {
    name: 'LoginView',
    components: {
        InputField,
        
    },
    data() {
        return {
            username: '',
            password: '',
            serviceClass: new AuthService()
        };
    },
    methods: {
        
        Login() {
            if (!this.username || !this.password) {
                this.$toast.error("Please fill in all fields")
                return;
            }

            this.serviceClass.login({
                username: this.username,
                password: this.password,
                client:"1"
            }).then((res) => {
                if (res) {
                    this.$router.push('/scanner');
                }
            }).catch((err) => {
                this.$toast.error(err)
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.login {
    width: 100vw;
    height: 100vh;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    background-color: white;
    padding: 30px 20px;

    .logo {
        width: 45px;
    }

    .login-box {
        margin-top: 10vh;

        .title {
            font-size: 24px;
            color: #1D1D1D;
            margin-top: 20px;
        }

        .login-btn {
            width: 100%;
            height: 50px;
            background-color: #1A1A1A;
            color: white;
            border: none;
            border-radius: 2px;
            font-size: 20px;
            margin-top: 20px;
            cursor: pointer;

            &:hover {
                background-color: #1A1A1A;
            }
        }
    }

    .footer {
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 5vh;
        left: 20px;
        font-size: 14px;
        color: #4F566B;
        background: white;
        .contact {
            color: #5469D4;
            margin-top: 8px;
            font-weight: bold;
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
