/* ============================================================
   WORKNEST - Auth & Data Store (localStorage-backed)
   Shared by signin, signup, dashboard and book-tour pages
   ============================================================ */

(function () {
  "use strict";

  var USERS_KEY = "worknest_users";
  var SESSION_KEY = "worknest_session";
  var TOURS_KEY = "worknest_tour_requests";

  function hashPassword(password) {
    var hash = 5381;
    for (var i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash + password.charCodeAt(i)) >>> 0;
    }
    return "h" + hash.toString(36) + "-" + password.length;
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  var Store = {
    getUsers: function () {
      return readJSON(USERS_KEY, []);
    },

    findUser: function (email) {
      var target = String(email || "").trim().toLowerCase();
      var users = this.getUsers();
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === target) return users[i];
      }
      return null;
    },

    createUser: function (data) {
      var user = {
        id: "u_" + Date.now().toString(36),
        name: String(data.name || "").trim(),
        email: String(data.email || "").trim().toLowerCase(),
        passHash: hashPassword(String(data.password)),
        role: data.role === "owner" ? "owner" : "member",
        createdAt: new Date().toISOString()
      };
      var users = this.getUsers();
      users.push(user);
      writeJSON(USERS_KEY, users);
      return user;
    },

    verifyCredentials: function (email, password) {
      var user = this.findUser(email);
      if (!user) return { ok: false, reason: "no-user", message: "No account found with this email. Please sign up first." };
      if (user.passHash !== hashPassword(String(password))) {
        return { ok: false, reason: "bad-password", message: "Incorrect password. Please try again." };
      }
      return { ok: true, user: user };
    },

    setPassword: function (email, newPassword) {
      var target = String(email).trim().toLowerCase();
      var newHash = hashPassword(newPassword);
      var users = this.getUsers().map(function (u) {
        if (u.email === target) u.passHash = newHash;
        return u;
      });
      writeJSON(USERS_KEY, users);
    },

    setSession: function (user, remember) {
      var session = { id: user.id, name: user.name, email: user.email, role: user.role };
      Store.clearSession();
      if (remember) {
        writeJSON(SESSION_KEY, session);
      } else {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* storage unavailable */ }
      }
      return session;
    },

    getSession: function () {
      var session = readJSON(SESSION_KEY, null);
      if (session) return session;
      try {
        var raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    },

    clearSession: function () {
      localStorage.removeItem(SESSION_KEY);
      try { sessionStorage.removeItem(SESSION_KEY); } catch (err) { /* storage unavailable */ }
    },

    getTours: function () {
      return readJSON(TOURS_KEY, []);
    },

    addTour: function (data) {
      var tour = {
        id: "t_" + Date.now().toString(36),
        name: String(data.name || "").trim(),
        email: String(data.email || "").trim(),
        phone: String(data.phone || "").trim(),
        property: String(data.property || "").trim(),
        city: String(data.city || "").trim(),
        date: data.date || "",
        time: data.time || "",
        message: String(data.message || "").trim(),
        source: data.source || "public",
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      var tours = this.getTours();
      tours.push(tour);
      writeJSON(TOURS_KEY, tours);
      return tour;
    },

    logout: function () {
      Store.clearSession();
      window.location.href = "signin.html";
    },

    requireAuth: function () {
      var session = Store.getSession();
      if (!session) {
        window.location.replace("signin.html?required=1");
        return null;
      }
      return session;
    }
  };

  window.WorkNestStore = Store;
})();
