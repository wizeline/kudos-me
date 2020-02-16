const END_POINT = '/api';

const kudosTable = Vue.component('kudosTable', {
  template: `
    <v-data-table
        :headers="headers"
        :fixedHeader="true"
        :items="kudos"
        :sort-by="['createdAt']"
        :sort-desc="[true]"
        class="elevation-1"
        :loading="loading" loading-text="Loading... Please wait"
      >
        <template v-slot:item.realName="{ item }">
          <v-avatar>
            <img
              :src=item.image
              :alt=item.realName
            >
          </v-avatar>
          <strong>{{item.realName}}</strong>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{item.createdAt|formatDate}}
        </template>
    </v-data-table>
  `,
  data: function() {
    return {
      loading: false,
      kudos: [],
      headers: [
        {
          text: 'Giver',
          align: 'left',
          value: 'realName',
        },
        { text: 'Message', value: 'text' },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Channel', value: 'channel_name' },
      ],
    };
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getKudosList(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type == 'SET_TO_DATE' || mutation.type == 'SET_FROM_DATE') {
        this.getKudosList(state.fromDate, state.toDate);
      }
    });
  },
  computed: {
    currentGiver() {
      return this.$route.params.givername;
    },
    currentReceiver() {
      return this.$route.params.receivername;
    },
  },
  methods: {
    getKudosList(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate > toDate) {
        this.kudos = [];
        return;
      }
      this.loading = true;
      apiGetKudos(fromDate, toDate).then(({ data: kudosList }) => {
        getUsers().then(usersResponse => {
          this.kudos = kudosList.map((k, index) => {
            const user = usersResponse[k.user_name];
            if (user) {
              k.id = index;
              k.name = user.name;
              k.tz = user.tz;
              k.realName = user.realName;
              k.image = user.image;
            }
            return k;
          });

          if (this.currentGiver || this.currentReceiver) {
            this.kudos = this.kudos.filter(
              k =>
                (this.currentGiver && this.currentGiver == k.name) ||
                (this.currentReceiver &&
                  k.text &&
                  k.text.includes(this.currentReceiver)),
            );
          }

          this.loading = false;
        });
      });
    },
  },
});

const giverTable = Vue.component('giverTable', {
  template: `
    <v-data-table
      :headers="headers"
      :items="givers"
      :fixed-header="true"
      :sort-by="['count']"
      :sort-desc="[true]"
      class="elevation-1"
      :loading="loading" loading-text="Loading... Please wait"
    >
      <template v-slot:item.realName="{ item }">
        <div>
        <v-avatar>
          <img
            :src=item.image
            :alt=item.realName
          >
        </v-avatar>
         <strong>{{item.realName}}</strong>
        </div>
      </template>
      <template v-slot:item.count="{ item }">
        <router-link :to="'/dashboard/kudos/giver/'+item.username">{{item.count}}</router-link>
      </template>
    </v-data-table>
  `,
  data: function() {
    return {
      givers: [],
      loading: false,
      headers: [
        {
          text: 'Display Name',
          align: 'left',
          sortable: false,
          value: 'realName',
        },
        { text: 'Count', value: 'count' },
        { text: 'Time Zone', value: 'tz' },
      ],
    };
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type == 'SET_TO_DATE' || mutation.type == 'SET_FROM_DATE') {
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    });
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate > toDate) {
        this.givers = [];
        return;
      }

      this.loading = true;
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        const giverCount = data.summary.giverCount;
        this.givers = Object.keys(giverCount).map(key => {
          let giver = {};
          giver.username = key;
          giver.count = giverCount[key];
          return giver;
        });

        getUsers().then(usersResponse => {
          this.givers = this.givers.map(r => {
            const user = usersResponse[r.username];
            if (user) {
              r.id = user.id;
              r.name = user.name;
              r.tz = user.tz;
              r.realName = user.realName;
              r.image = user.image;
            }
            return r;
          });
          this.loading = false;
        });
      });
    },
  },
});

const receiverTable = Vue.component('receiverTable', {
  template: `
    <v-data-table
      :headers="headers"
      :items="receivers"
      :fixed-header="true"
      :sort-by="['count']"
      :sort-desc="[true]"
      class="elevation-1"
      :loading="loading" loading-text="Loading... Please wait"
    >
      <template v-slot:item.realName="{ item }">
        <div>
        <v-avatar>
          <img
            :src=item.image
            :alt=item.realName
          >
        </v-avatar>
         <strong>{{item.realName}}</strong>
        </div>
      </template>
      <template v-slot:item.count="{ item }">
        <router-link :to="'/dashboard/kudos/receiver/'+item.username">{{item.count}}</router-link>
      </template>
    </v-data-table>
  `,
  data: function() {
    return {
      receivers: [],
      loading: false,
      headers: [
        {
          text: 'Display Name',
          align: 'left',
          sortable: false,
          value: 'realName',
        },
        { text: 'Count', value: 'count' },
        { text: 'Time Zone', value: 'tz' },
      ],
    };
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type == 'SET_TO_DATE' || mutation.type == 'SET_FROM_DATE') {
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    });
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate > toDate) {
        this.receivers = [];
        return;
      }
      this.loading = true;
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        this.loading = false;
        const receiverCount = data.summary.receiverCount;
        this.receivers = Object.keys(receiverCount).map(key => {
          let giver = {};
          giver.username = key;
          giver.count = receiverCount[key];
          return giver;
        });

        getUsers().then(usersResponse => {
          this.receivers = this.receivers.map(r => {
            const user = usersResponse[r.username];
            if (user) {
              r.id = user.id;
              r.name = user.name;
              r.tz = user.tz;
              r.realName = user.realName;
              r.image = user.image;
            }
            return r;
          });
        });
      });
    },
  },
});

const store = new Vuex.Store({
  state: {
    fromDate: getLastMonthFirstDate(),
    toDate: getThisMonthLastDate(),
    userProfile: {
      displayName: 'Wizeline',
      photoURL: 'https://itviec.com/employers/wizeline/logo/w170/eAitKXUaV26RmxaT7V8mwxev/wizeline-logo.png'
    }
  },
  getters: {
    getFromDate: state => state.fromDate,
    getToDate: state => state.toDate,
    getUserProfile: state => state.userProfile
  },
  mutations: {
    SET_FROM_DATE(state, fromDate) {
      state.fromDate = fromDate;
    },
    SET_TO_DATE(state, toDate) {
      state.toDate = toDate;
    },
    SET_USER_PROFILE(state, userProfile) {
      state.userProfile = userProfile;
    },
  },
  actions: {
    setFromDate({ commit }, fromDate) {
      commit('SET_FROM_DATE', fromDate);
    },
    setToDate({ commit }, toDate) {
      commit('SET_TO_DATE', toDate);
    },
    setUserProfile({ commit }, userProfile) {
      commit('SET_USER_PROFILE', userProfile);
    },
  },
});

Vue.filter('formatDate', function(value) {
  if (value) {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'medium',
      dateStyle: 'medium',
    }).format(new Date(value));
  }
});

const dashboardPage = Vue.component('dashboard', {
  data: function() {
    return {
      isAuthenticated: false,
      drawer: true,
      right: false,
      expandOnHover: false,
      miniVariant: false,
      fromDateMenu: false,
      toDateMenu: false,
      menuVisible: false,
      fromDate: getLastMonthFirstDate(),
      toDate: getThisMonthLastDate(),
      items: [
        {
          title: 'Leaderboard',
          icon: 'mdi-view-dashboard',
          link: '/dashboard/',
        },
        {
          title: 'Giver',
          icon: 'mdi-send',
          link: '/dashboard/giver'
        },
        {
          title: 'Kudos',
          icon: 'mdi-message-text',
          link: '/dashboard/kudos'
        },
      ],
    };
  },
  computed: {
    isLoading() {
      return this.$store.getters.getIsLoading;
    },
    getFromDateString() {
      return new Date(this.fromDate).toISOString().substr(0, 10);
    },
    getToDateString() {
      return new Date(this.toDate).toISOString().substr(0, 10);
    },
    getUserProfile(){
      return this.$store.getters.getUserProfile;
    }
  },
  watch: {
    fromDate(newVal, oldVal) {
      if (newVal && oldVal && newVal == oldVal) {
        return;
      }
      this.$store.dispatch('setFromDate', newVal);
    },
    toDate(newVal, oldVal) {
      if (newVal && oldVal && newVal == oldVal) {
        return;
      }
      this.$store.dispatch('setToDate', newVal);
    },
  },
  template: `
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      :expand-on-hover="expandOnHover"
      :mini-variant="miniVariant"
      :right="right"
      absolute
      dark
      app
    >
      <v-list
        dense
        nav
        class="py-0"
      >
        <v-list-item two-line :class="miniVariant && 'px-0'">
          <v-list-item-avatar>
            <img :src="getUserProfile.photoURL">
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{getUserProfile.displayName}}</v-list-item-title>
            <v-list-item-subtitle></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to=item.link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      color="deep-purple accent-4"
      dark
      app >
      <v-toolbar-title>Kudos Me</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon title="Logout" @click="onLogoutClick">
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container fluid>
      <v-row>
        <v-col cols="12" lg="3">
          <v-menu
            v-model="fromDateMenu"
            :close-on-content-click="false"
            max-width="290"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                :value="getFromDateString"
                clearable
                label="From Date: "
                readonly
                v-on="on"
                @click:clear="fromDate = null"
                @blur="fromDate = parseDate(getFromDateString)"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="fromDate"
              @change="fromDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" lg="3">
          <v-menu
            v-model="toDateMenu"
            :close-on-content-click="false"
            max-width="290"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                :value="getToDateString"
                clearable
                label="To Date: "
                readonly
                v-on="on"
                @click:clear="toDate = null"
                @blur="toDate = parseDate(getToDateString)"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="toDate"
              @change="toDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        </v-row>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app>
    </v-footer>
  </v-app>
  `,
  methods: {
    parseDate(date) {
      if (!date) return null;
      return new Date(date).toISOString().substr(0, 10);
    },
    onLogoutClick(){
      const me = this;
      firebase.auth().signOut().then(function() {
        localStorage.clear()
        me.$router.push('/login');
      }).catch(function(error) {
        console.log("error:", error);
        localStorage.clear()
      });
    }
  },
  created:function(){
    const userProfile = localStoreCacheGet('userProfile');
    if(userProfile){
      this.$store.dispatch('setUserProfile', userProfile);
    }
  }
});

const homePage = Vue.component('HomePage', {
  template: `
  <v-app id="home">
      <v-content>
        <transition mode="out-in">
           <router-view></router-view>
        </transition>
     </v-content>
   </v-app>
  `,
});

const loginPage = Vue.component('LoginPage', {
  template: `
  <v-container
      fluid
      fill-height
    >
      <v-layout
        align-center
        justify-center
      >
        <v-btn color="error" @click="submit">
          <v-icon left>mdi-google</v-icon>
          Login with Wizeline Account
        </v-btn>
      </v-layout>
    </v-container>
  `,
  methods: {
    submit() {
      const me = this;
      firebase
        .auth()
        .signInWithPopup(googleAuthNProvider)
        .then(data => {
          this.$store.dispatch('setUserProfile', data.user);
          localStoreCachePut('userProfile', data.user);
          firebase.auth()
          .currentUser.getIdToken()
          .then(function(idToken) {
            localStoreCachePut('idToken', idToken, true);
            me.$router.push("/dashboard");
          }).catch(function(error) {
            console.log("getIdToken error:", err);
            me.$router.push("/login");
          });
        })
        .catch(err => {
          console.log("signInWithPopup error:", err);
          this.error = err.message;
        });
    },
  },
});

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: homePage,
      children: [
        {
          path: '/login',
          component: loginPage,
        }
      ],
    },
    {
      path: '/dashboard',
      component: dashboardPage,
      children: [
        { path: '', component: receiverTable },
        { path: 'giver', component: giverTable },
        { path: 'kudos', component: kudosTable },
        { path: 'kudos/giver/:givername', component: kudosTable },
        { path: 'kudos/receiver/:receivername', component: kudosTable },
        { path: '*', component: receiverTable }
      ],
    },
    {
      path: '/*',
      component: loginPage
    }
  ],
});

const App = new Vue({
  router,
  store,
  vuetify: new Vuetify(),
  template: `
    <main>
      <transition mode="out-in">
        <router-view></router-view>
      </transition>
    </main>
   `,
  mounted:function(){
    if (!this.getIsAuthenticated()) {
      this.$router.push('/login');
    }
  },
  methods: {
    getIsAuthenticated() {
      const idToken = localStoreCacheGet('idToken', true);
      return idToken && idToken.length;
    },
  },
  beforeRouteUpdate(to, from, next) {
    if (this.getIsAuthenticated()) {
      next();
    } else {
      next('/login');
    }
  },
}).$mount('#app');

function apiGetLeaderBoard(fromDate, toDate) {
  return fetchWapper(
    END_POINT + '/kudos/leaderboard?fromDate=' + fromDate + '&toDate=' + toDate,
  ).then(res => res);
}

function apiGetKudos(fromDate, toDate) {
  return fetchWapper(
    END_POINT + '/commands/kudos?fromDate=' + fromDate + '&toDate=' + toDate,
  ).then(res => res);
}

function getUsers() {
  const cacheKey = 'users-key';
  const cachedUsers = cacheGet(cacheKey);
  if (cachedUsers) {
    return Promise.resolve(cachedUsers);
  }

  return fetchWapper(END_POINT + '/users/')
    .then(({ data }) => {
      const cacheData = data.members.reduce((acc, member) => {
        acc[member.name] = {
          ...member,
        };
        return acc;
      }, {});
      cachePut(cacheKey, cacheData);
      return cacheData;
    });
}

function fetchWapper(url){
  const accessToken = localStoreCacheGet('idToken', true);
  return fetch(
    url,
    {
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(errorHandling)
  .then(res=>res.json());
}

function errorHandling(response){
  if(response.status == 401){
    window.location.href = '/#/login';
    return response;
  }
  return response;
}

function getLastMonthFirstDate() {
  let now = new Date();
  let year = now.getFullYear();
  let lastMonth = now.getMonth();
  if (now.getMonth() == 0) {
    lastMonth = 11;
    year = now.getFullYear() - 1;
  } else {
    lastMonth -= 1;
  }
  return new Date(year, lastMonth, 1).toISOString().substr(0, 10);
}

function getThisMonthLastDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .substr(0, 10);
}

function cachePut(key, object) {
  sessionStorage.setItem(key, JSON.stringify(object));
}

function cacheGet(key) {
  const cached = sessionStorage.getItem(key);
  return cached ? JSON.parse(cached) : cached;
}

function localStoreCacheGet(key, isString = false ){
  const cached = localStorage.getItem(key);
  if(isString){
    return cached;
  }
  return cached ? JSON.parse(cached) : cached;
}

function localStoreCachePut(key, object, isString = false){
  if(isString){
    return localStorage.setItem(key, object);
  }
  return localStorage.setItem(key, JSON.stringify(object));
}
