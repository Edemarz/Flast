const express = require("express");
const http = require("http");
const url = require(`url`);
const path = require(`path`);
const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ejs = require("ejs");
const fs = require("fs")
const passport = require(`passport`);
const bodyParser = require("body-parser");
const Strategy = require(`passport-discord`).Strategy;
const ClientSettings = require("../ClientData.json");
const mongoose = require("mongoose");
const SuggestionDB = require("../models/SuggestionSystem");
const MuteDB = require("../models/MuteDB");
const VerificationDB = require("../models/VerificationSystem");
const WelcomeDB = require("../models/WelcomeDB");
const TicketMessageDB = require("../models/TicketMessageDB");
const TicketDB = require("../models/TicketSystemDB");
const DBMessage = require("../models/VerificationMessage");
const EcoSettings = require("../models/EcoSettings");

module.exports = async (client) => {
  //Express Stuff
  const app = express();
  const session = require("express-session");

  const MemoryStore = require("memorystore")(session);

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
  passport.use(new Strategy({
    clientID: ClientSettings.Dashboard.clientId,
    clientSecret: ClientSettings.Dashboard.clientSecret,
    callbackURL: `${ClientSettings.Dashboard.host}/callback`,
    scope: ClientSettings.Dashboard.scope
  },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }));

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
    resave: false,
    saveUninitialized: false,
  }));

  // initialize passport middleware.
  app.use(passport.initialize());
  app.use(passport.session());


  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, './views'))


  //Those for app.use(s) are for the input of the post method (updateing settings)
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));

  //LOAD THE ASSETS
  app.use(express.static(path.join(__dirname, './public')));
  //Load .well-known (if available)
  app.use(express.static(path.join(__dirname, '/'), { dotfiles: 'allow' }));

  // We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };

  //Rendering pages.

  app.get(`/login`, (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = `/`;
    }
    next();
  }, passport.authenticate(`discord`, { prompt: `none` })
  );


  //Callback endpoint for the login data
  app.get(`/callback`, passport.authenticate(`discord`, { failureRedirect: "/" }), async (req, res) => {
    let banned = false // req.user.id
    if (banned) {
      req.session.destroy(() => {
        res.json({ login: false, message: `You have been blocked from the Dashboard.`, logout: true })
        req.logout();
      });
    } else {
      res.redirect(`/dashboard`)
    }
  });

  app.get("/", (req, res) => {
    res.render("index", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      clientSettings: ClientSettings,
      client: client,
      cat: client.categories
    });
  });

  app.get("/commands", (req, res) => {
    res.render("commands", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      clientSettings: ClientSettings,
      client: client,
      cat: client.categories,
      commands: client.commands
    });
  });

  app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated() || req.isAuthenticated() === false) return res.redirect(`${ClientSettings.Dashboard.host}/login`);
    res.render("dashboard", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      clientSettings: ClientSettings,
      client: client,
      cat: client.categories,
      commands: client.commands,
      Permissions: Permissions
    });
  });

  app.get(`/logout`, function (req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect(`/`);
    });
  });

  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard?error=" + encodeURIComponent("Can't get Guild Information Data"));
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch (err) {
        console.error(`Couldn't fetch ${req.user.id} in ${guild.name}: ${err}`);
      }
    }
    if (!member) return res.redirect("/dashboard?error=" + encodeURIComponent("Unable to fetch you, sorry!"));
    if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
      return res.redirect("/dashboard?error=" + encodeURIComponent("You are not allowed to do that!"));
    }

    res.render("Dashboard-System", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: client.guilds.cache.get(req.params.guildID),
      client: client,
      Permissions: Permissions,
      clientSettings: ClientSettings,
      categories: client.categories,
      commands: client.commands
    }
    );
  });

  app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard?error=" + encodeURIComponent("Can't get Guild Information Data!"));
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch (err) {
        console.error(`Couldn't fetch ${req.user.id} in ${guild.name}: ${err}`);
      }
    }
    if (!member) return res.redirect("/dashboard?error=" + encodeURIComponent("Can't Information Data about you!"));
    if (!member.permissions.has("MANAGE_GUILD")) {
      return res.redirect("/dashboard?error=" + encodeURIComponent("You are not allowed to do that!"));
    }
    if (req.body.suggestion) {
      const searchSuggestion = await SuggestionDB.findOne({
        GuildID: req.params.guildID
      });

      if (searchSuggestion) {
        await searchSuggestion.updateOne({
          GuildID: req.params.guildID,
          ChannelID: req.body.suggestion
        });
      }

      if (!searchSuggestion) {
        await new SuggestionDB({
          GuildID: req.params.guildID,
          ChannelID: req.body.suggestion
        }).save()
      };
    };

    if (req.body.muterole && req.body.memrole) {
      const searchMute = await MuteDB.findOne({
        GuildID: req.params.guildID
      });

      if (searchMute) {
        await searchMute.updateOne({
          GuildID: req.params.guildID,
          MuteRole: req.body.muterole,
          MemberRole: req.body.memrole
        });
      }

      if (!searchMute) {
        await new MuteDB({
          GuildID: req.params.guildID,
          MuteRole: req.body.muterole,
          MemberRole: req.body.memrole
        }).save()
      };
    };

    if (req.body.verchannel && req.body.verrole && req.body.vertype) {
      const verCheck = await VerificationDB.findOne({
        GuildID: req.params.guildID
      });

      const updatedType = (req.body.vertype === 'text-based') ? "text-based" : (req.body.vertype === 'react-based') ? "react-based" : null;

      if (verCheck) {
        await verCheck.updateOne({
          GuildID: req.params.guildID,
          VerificationChannel: req.body.verchannel,
          VerificationRole: req.body.verrole,
          VerificationType: { type: updatedType ? updatedType : "text-based" }
        });

        if (updatedType && updatedType === "text-based") {
          const guild = client.guilds.cache.get(req.params.guildID);

          if (guild) {
            const ch = guild.channels.cache.get(req.body.verchannel);

            if (ch) {
              const VerifyNow = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(`Please send a message containing exactly \`I agree to be a member of ${guild.name}\` (Capitals Letter Included) to verify!`)

              ch.send({ embeds: [VerifyNow] });
            }
          }
        }

        if (updatedType && updatedType === "react-based") {
          const guild = client.guilds.cache.get(req.params.guildID);

          if (guild) {
            const ch = guild.channels.cache.get(req.body.verchannel);

            if (ch) {
              const VerifyNow = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(`Please react to this message to verify!`)

              const msg = await ch.send({ embeds: [VerifyNow] });

              await new DBMessage({
                GuildID: guild.id,
                MessageID: msg.id
              }).save()

              await msg.react("⭐");
            }
          }
        }
      };

      if (!verCheck) {
        await new VerificationDB({
          GuildID: req.params.guildID,
          VerificationChannel: req.body.verchannel,
          VerificationRole: req.body.verrole,
          VerificationType: { type: updatedType ? updatedType : "text-based" }
        }).save();

        if (updatedType && updatedType === "text-based") {
          const guild = client.guilds.cache.get(req.params.guildID);

          if (guild) {
            const ch = guild.channels.cache.get(req.body.verchannel);

            if (ch) {
              const VerifyNow = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(`Please send a message containing exactly \`I agree to be a member of ${guild.name}\` (Capitals Letter Included) to verify!`)

              ch.send({ embeds: [VerifyNow] });
            }
          }
        }

        if (updatedType && updatedType === "react-based") {
          const guild = client.guilds.cache.get(req.params.guildID);

          if (guild) {
            const ch = guild.channels.cache.get(req.body.verchannel);

            if (ch) {
              const VerifyNow = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(`Please react to this message to verify!`)

              const msg = await ch.send({ embeds: [VerifyNow] });

              await new DBMessage({
                GuildID: guild.id,
                MessageID: msg.id
              }).save()

              await msg.react("⭐");
            }
          }
        }
      };
    };

    if (req.body.welcchannel && req.body.welcrole) {
      const welcCheck = await WelcomeDB.findOne({
        GuildID: req.params.guildID
      });

      if (welcCheck) {
        await welcCheck.updateOne({
          GuildID: req.params.guildID,
          RoleID: req.body.welcrole,
          ChannelID: req.body.welcchannel
        });
      };

      if (!welcCheck) {
        await new WelcomeDB({
          GuildID: req.params.guildID,
          RoleID: req.body.welcrole,
          ChannelID: req.body.welcchannel
        }).save()
      };
    };

    if (req.body.tickchannel && req.body.tickmanager && req.body.tickdesc && req.body.ticktitle && req.body.tickcolor) {
      const TicketCheck = await TicketDB.findOne({
        GuildID: req.params.guildID
      });

      if (TicketCheck) {
        await TicketCheck.updateOne({
          GuildID: req.params.guildID,
          Description: req.body.tickdesc,
          TicketManager: req.body.tickmanager,
          TicketChannel: req.body.tickchannel,
          Color: req.body.tickcolor,
          Title: req.body.ticktitle
        });

        const guild = client.guilds.cache.get(req.params.guildID);

        if (guild) {
          const ch = guild.channels.cache.get(req.body.tickchannel);

          if (ch) {
            const ticketEmbed = new MessageEmbed()
              .setTitle(req.body.ticktitle)
              .setDescription(req.body.tickdesc)
              .setColor(req.body.tickcolor)
              .setTimestamp()
              .setFooter(guild.name, guild.iconURL({ dynamic: true }))

            const btnRow = new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("PRIMARY")
                .setCustomId("ticket-button")
                .setLabel("Open Ticket")
                .setEmoji("✉️")
            );

            const mgsGroupB = await ch.send({ embeds: [ticketEmbed], components: [btnRow] });

            const messageDB = await TicketMessageDB.findOne({
              GuildID: req.params.guildID
            });

            if (messageDB) {
              await messageDB.deleteOne();

              await new TicketMessageDB({
                GuildID: req.params.guildID,
                MessageID: mgsGroupB.id
              }).save()
            };

            if (!messageDB) {
              await new TicketMessageDB({
                GuildID: req.params.guildID,
                MessageID: mgsGroupB.id
              }).save()
            }
          }
        }
      }
    }

    if (req.body.disecocmd && req.body.disecomode) {
      let SettingsSearch = await EcoSettings.findOne({
        GuildID: req.params.guildID
      });

      if (!SettingsSearch) {
        await new EcoSettings({
          GuildID: req.params.guildID,
          Disabled: { Commands: [] },
          Amount: 0
        }).save();

        SettingsSearch = await EcoSettings.findOne({
          GuildID: req.params.guildID
        });
      };


      if (SettingsSearch && SettingsSearch.Disabled.Commands) {
        if (req.body.disecomode === 'enable') {
          const filteredCmds = [];

          await SettingsSearch.Disabled.Commands.filter((cmd) => cmd != req.body.disecocmd).forEach((cmd) => filteredCmds.push(cmd));

          await SettingsSearch.updateOne({
            GuildID: req.params.guildID,
            Disabled: { Commands: filteredCmds ? filteredCmds : null },
            Amount: SettingsSearch.Amount ? SettingsSearch.Amount - 1 : 0
          });
        }

        if (req.body.disecomode === 'disable') {
            await SettingsSearch.Disabled.Commands.push(req.body.disecocmd);

            await SettingsSearch.updateOne({
              GuildID: req.params.guildID,
              Disabled: SettingsSearch.Disabled,
              Amount: SettingsSearch.Amount ? SettingsSearch.Amount + 1 : 1
            });
        };
      };
    };

    res.render("Dashboard-System", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: client.guilds.cache.get(req.params.guildID),
      client: client,
      Permissions: Permissions,
      clientSettings: ClientSettings,
      categories: client.categories,
      commands: client.commands
    }
    );
  });

  app.listen(ClientSettings.Dashboard.port, () => console.log(client.colorText("Dashboard Loaded!")))
}