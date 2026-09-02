import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
    <main v-if="loading">
        <Spinner></Spinner>
    </main>
    <main v-else class="page-list">
        <div class="list-container">
            <table class="list" v-if="list">
                <!-- Usamos template para poder inyectar los separadores sin romper la tabla -->
                <template v-for="([level, err], i) in list">
                    
                    <!-- Separador Extended List (Aparece antes del nivel 31) -->
                    <tr v-if="i === 30">
                        <td colspan="2" style="text-align: center; padding: 15px 0;">
                            <p class="type-label-lg" style="color: #888; font-weight: bold; border-top: 1px solid #444; border-bottom: 1px solid #444; padding: 5px 0;">Extended List</p>
                        </td>
                    </tr>

                    <!-- Separador Legacy List (Aparece antes del nivel 61) -->
                    <tr v-if="i === 60">
                        <td colspan="2" style="text-align: center; padding: 15px 0;">
                            <p class="type-label-lg" style="color: #888; font-weight: bold; border-top: 1px solid #444; border-bottom: 1px solid #444; padding: 5px 0;">Legacy List</p>
                        </td>
                    </tr>

                    <!-- Fila normal del nivel -->
                    <tr>
                        <td class="rank">
                            <p v-if="i + 1 <= 60" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
        <div class="level-container">
            <div class="level" v-if="level">
                <h1>{{ level.name }}</h1>
                <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                <ul class="stats">
                    <li>
                        <div class="type-title-sm">Points when completed</div>
                        <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                    </li>
                    <li>
                        <div class="type-title-sm">ID</div>
                        <p>{{ level.id }}</p>
                    </li>
                    <li>
                        <div class="type-title-sm">Password</div>
                        <p>{{ level.password || 'Free to Copy' }}</p>
                    </li>
                </ul>
                <h2>Records</h2>
                
                <!-- Lógica ajustada a tus cortes de 30 (Main) y 60 (Extended) -->
                <p v-if="selected + 1 <= 30"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                <p v-else-if="selected + 1 <= 60"><strong>100%</strong> or better to qualify</p>
                <p v-else>This level does not accept new records.</p>
                
                <table class="records">
                    <tr v-for="record in level.records" class="record">
                        <td class="percent">
                            <p>{{ record.percent }}%</p>
                        </td>
                        <td class="user">
                            <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                        </td>
                        <td class="mobile">
                            <img v-if="record.mobile" :src="\`./assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                        </td>
                        <td class="hz">
                            <p>{{ record.hz }}Hz</p>
                        </td>
                    </tr>
                </table>
            </div>
            <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                <p>(ノಠ益ಠ)ノ彡┻━┻</p>
            </div>
        </div>
        <div class="meta-container">
            <div class="meta">
                <div class="errors" v-show="errors.length > 0">
                    <p class="error" v-for="error of errors">{{ error }}</p>
                </div>
                <div class="og">
                    <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                </div>
                <template v-if="editors">
                    <h3>List Editors</h3>
                    <ol class="editors">
                        <li v-for="editor in editors">
                            <img :src="\`./assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                            <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                            <p v-else>{{ editor.name }}</p>
                        </li>
                    </ol>
                </template>
               <h3>Requisitos de Envío</h3>
<p>
    Haber conseguido el récord sin el uso de hacks (sin embargo, el FPS bypass está permitido)
</p>
<p>
    Haber completado el récord en la copia con rate del nivel
</p>
<p>
    El video debe incluir audio del juego (source audio),y desde la dificultad Insane Demon en adelante clicks o taps audibles y el contador de clicks por segundo (CPS), se permiten ClickSounds para los que no tengan microfono.
</p>
<p>
    TODAS las completaciones deben tener Cheat indicator
</p>
<p>
    La grabación debe mostrar claramente al jugador tocando la pared final (endwall)
</p>
<p>
    Queda estrictamente prohibido el uso de rutas secretas que afecten la dificultad o se salten una parte del nivel.
</p>
<p>
    No se permiten "easy modes"; únicamente es válido el récord del nivel original sin modificaciones.
</p>
<p>
    :)
</p>
            </div>
        </div>
    </main>
`,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
