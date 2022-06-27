// ------------------------------ Messages start ---------------------------
var Layout = require("Layout");
var settings = require('Storage').readJSON("messages.settings.json", true) || {};
var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15") ? "6x15" : "6x8:2";
var fontBig = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
var fontLarge = g.getFonts().includes("6x15") ? "6x15:2" : "6x8:4";
var active; // active screen
var openMusic = false; // go back to music screen after we handle something else?
// hack for 2v10 firmware's lack of ':size' font handling
try {
  g.setFont("6x8:2");
} catch (e) {
  g._setFont = g.setFont;
  g.setFont = function (f, s) {
    if (f.includes(":")) {
      f = f.split(":");
      return g._setFont(f[0], f[1]);
    }
    return g._setFont(f, s);
  };
}

/** this is a timeout if the app has started and is showing a single message
but the user hasn't seen it (eg no user input) - in which case
we should start a timeout for settings.unreadTimeout to return
to the clock. */
var unreadTimeout;
/// List of all our messages
//var MESSAGES = [{"t":"notify","id":1575479849,"src":"Hangouts","title":"First","body":"message contentsasdasdasdasdasdasd", new: true}];
var MESSAGES = require("Storage").readJSON("messages.json", 1) || [];
if (!Array.isArray(MESSAGES)) MESSAGES = [];
var onMessagesModified = function (msg) {
  // TODO: if new, show this new one
  if (msg && msg.id !== "music" && msg.new && !((require('Storage').readJSON('setting.json', 1) || {}).quiet)) {
    if (WIDGETS["messages"]) WIDGETS["messages"].buzz();
    else Bangle.buzz();
  }
  if (msg && msg.id == "music") {
    if (msg.state && msg.state != "play") openMusic = false; // no longer playing music to go back to
    if (active != "music") return; // don't open music over other screens
  }
  showMessage(msg && msg.id);
};
function saveMessages() {
  require("Storage").writeJSON("messages.json", MESSAGES)
}

function getBackImage() {
  return atob("FhYBAAAAEAAAwAAHAAA//wH//wf//g///BwB+DAB4EAHwAAPAAA8AADwAAPAAB4AAHgAB+AH/wA/+AD/wAH8AA==");
}
function getNotificationImage() {
  return atob("HBKBAD///8H///iP//8cf//j4//8f5//j/x/8//j/H//H4//4PB//EYj/44HH/Hw+P4//8fH//44///xH///g////A==");
}
function getFBIcon() {
  return atob("GBiBAAAAAAAAAAAYAAD/AAP/wAf/4A/48A/g8B/g+B/j+B/n+D/n/D8A/B8A+B+B+B/n+A/n8A/n8Afn4APnwADnAAAAAAAAAAAAAA==");
}
function getPosImage() {
  return atob("GRSBAAAAAYAAAcAAAeAAAfAAAfAAAfAAAfAAAfAAAfBgAfA4AfAeAfAPgfAD4fAA+fAAP/AAD/AAA/AAAPAAADAAAA==");
}
function getNegImage() {
  return atob("FhaBADAAMeAB78AP/4B/fwP4/h/B/P4D//AH/4AP/AAf4AB/gAP/AB/+AP/8B/P4P4fx/A/v4B//AD94AHjAAMA=");
}
/*
* icons should be 24x24px with 1bpp colors and 'Transparency to Color'
* http://www.espruino.com/Image+Converter
*/
function getMessageImage(msg) {
  if (msg.img) return atob(msg.img);
  var s = (msg.src || "").toLowerCase();
  if (s == "alarm" || s == "alarmclockreceiver") return atob("GBjBAP////8AAAAAAAACAEAHAOAefng5/5wTgcgHAOAOGHAMGDAYGBgYGBgYGBgYGBgYDhgYBxgMATAOAHAHAOADgcAB/4AAfgAAAAAAAAA=");
  if (s == "bibel") return atob("GBgBAAAAA//wD//4D//4H//4H/f4H/f4H+P4H4D4H4D4H/f4H/f4H/f4H/f4H/f4H//4H//4H//4GAAAEAAAEAAACAAAB//4AAAA");
  if (s == "calendar") return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
  if (s == "corona-warn") return atob("GBgBAAAAABwAAP+AAf/gA//wB/PwD/PgDzvAHzuAP8EAP8AAPAAAPMAAP8AAH8AAHzsADzuAB/PAB/PgA//wAP/gAH+AAAwAAAAA");
  if (s == "discord") return atob("GBgBAAAAAAAAAAAAAIEABwDgDP8wH//4H//4P//8P//8P//8Pjx8fhh+fzz+f//+f//+e//ePH48HwD4AgBAAAAAAAAAAAAAAAAA");
  if (s == "facebook") return getFBIcon();
  if (s == "gmail") return getNotificationImage();
  if (s == "google home") return atob("GBiCAAAAAAAAAAAAAAAAAAAAAoAAAAAACqAAAAAAKqwAAAAAqroAAAACquqAAAAKq+qgAAAqr/qoAACqv/6qAAKq//+qgA6r///qsAqr///6sAqv///6sAqv///6sAqv///6sA6v///6sA6v///qsA6qqqqqsA6qqqqqsA6qqqqqsAP7///vwAAAAAAAAAAAAAAAAA==");
  if (s == "hangouts") return atob("FBaBAAH4AH/gD/8B//g//8P//H5n58Y+fGPnxj5+d+fmfj//4//8H//B//gH/4A/8AA+AAHAABgAAAA=");
  if (s == "home assistant") return atob("FhaBAAAAAADAAAeAAD8AAf4AD/3AfP8D7fwft/D/P8ec572zbzbNsOEhw+AfD8D8P4fw/z/D/P8P8/w/z/AAAAA=");
  if (s == "instagram") return atob("GBiBAAAAAAAAAAAAAAAAAAP/wAYAYAwAMAgAkAh+EAjDEAiBEAiBEAiBEAiBEAjDEAh+EAgAEAwAMAYAYAP/wAAAAAAAAAAAAAAAAA==");
  if (s == "kalender") return atob("GBgBBgBgBQCgff++RQCiRgBiQAACf//+QAACQAACR//iRJkiRIEiR//iRNsiRIEiRJkiR//iRIEiRIEiR//iQAACQAACf//+AAAA");
  if (s == "lieferando") return atob("GBgBABgAAH5wAP9wAf/4A//4B//4D//4H//4P/88fV8+fV4//V4//Vw/HVw4HVw4HBg4HBg4HBg4HDg4Hjw4Hj84Hj44Hj44Hj44");
  if (s == "mail") return getNotificationImage();
  if (s == "messenger") return getFBIcon();
  if (s == "nina") return atob("GBgBAAAABAAQCAAICAAIEAAEEgAkJAgSJBwSKRxKSj4pUn8lVP+VVP+VUgAlSgApKQBKJAASJAASEgAkEAAECAAICAAIBAAQAAAA");
  if (s == "outlook mail") return atob("HBwBAAAAAAAAAAAIAAAfwAAP/gAB/+AAP/5/A//v/D/+/8P/7/g+Pv8Dye/gPd74w5znHDnOB8Oc4Pw8nv/Dwe/8Pj7/w//v/D/+/8P/7/gf/gAA/+AAAfwAAACAAAAAAAAAAAA=");
  if (s == "phone") return atob("FxeBABgAAPgAAfAAB/AAD+AAH+AAP8AAP4AAfgAA/AAA+AAA+AAA+AAB+AAB+AAB+OAB//AB//gB//gA//AA/8AAf4AAPAA=");
  if (s == "post & dhl") return atob("GBgBAPgAE/5wMwZ8NgN8NgP4NgP4HgP4HgPwDwfgD//AB/+AAf8AAAAABs7AHcdgG4MwAAAAGESAFESAEkSAEnyAEkSAFESAGETw");
  if (s == "signal") return atob("GBgBAAAAAGwAAQGAAhggCP8QE//AB//oJ//kL//wD//0D//wT//wD//wL//0J//kB//oA//ICf8ABfxgBYBAADoABMAABAAAAAAA");
  if (s == "skype") return atob("GhoBB8AAB//AA//+Af//wH//+D///w/8D+P8Afz/DD8/j4/H4fP5/A/+f4B/n/gP5//B+fj8fj4/H8+DB/PwA/x/A/8P///B///gP//4B//8AD/+AAA+AA==");
  if (s == "slack") return atob("GBiBAAAAAAAAAABAAAHvAAHvAADvAAAPAB/PMB/veD/veB/mcAAAABzH8B3v+B3v+B3n8AHgAAHuAAHvAAHvAADGAAAAAAAAAAAAAA==");
  if (s == "sms message") return getNotificationImage();
  if (s == "snapchat") return atob("GBgBAAAAAAAAAH4AAf+AAf+AA//AA//AA//AA//AA//AH//4D//wB//gA//AB//gD//wH//4f//+P//8D//wAf+AAH4AAAAAAAAA");
  if (s == "teams") return atob("GBgBAAAAAAAAAAQAAB4AAD8IAA8cP/M+f/scf/gIeDgAfvvefvvffvvffvvffvvff/vff/veP/PeAA/cAH/AAD+AAD8AAAQAAAAA");
  if (s == "telegram") return atob("GBiBAAAAAAAAAAAAAAAAAwAAHwAA/wAD/wAf3gD/Pgf+fh/4/v/z/P/H/D8P/Acf/AM//AF/+AF/+AH/+ADz+ADh+ADAcAAAMAAAAA==");
  if (s == "threema") return atob("GBjB/4Yx//8AAAAAAAAAAAAAfgAB/4AD/8AH/+AH/+AP//AP2/APw/APw/AHw+AH/+AH/8AH/4AH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
  if (s == "to do") return atob("GBgBAAAAAAAAAAAwAAB4AAD8AAH+AAP/DAf/Hg//Px/+f7/8///4///wf//gP//AH/+AD/8AB/4AA/wAAfgAAPAAAGAAAAAAAAAA");
  if (s == "twitch") return atob("GBgBH//+P//+P//+eAAGeAAGeAAGeDGGeDOGeDOGeDOGeDOGeDOGeDOGeAAOeAAOeAAcf4/4f5/wf7/gf//Af/+AA/AAA+AAAcAA");
  if (s == "twitter") return atob("GhYBAABgAAB+JgA/8cAf/ngH/5+B/8P8f+D///h///4f//+D///g///wD//8B//+AP//gD//wAP/8AB/+AB/+AH//AAf/AAAYAAA");
  if (s == "whatsapp") return atob("GBiBAAB+AAP/wAf/4A//8B//+D///H9//n5//nw//vw///x///5///4///8e//+EP3/APn/wPn/+/j///H//+H//8H//4H//wMB+AA==");
  if (s == "wordfeud") return atob("GBgCWqqqqqqlf//////9v//////+v/////++v/////++v8///Lu+v8///L++v8///P/+v8v//P/+v9v//P/+v+fx/P/+v+Pk+P/+v/PN+f/+v/POuv/+v/Ofdv/+v/NvM//+v/I/Y//+v/k/k//+v/i/w//+v/7/6//+v//////+v//////+f//////9Wqqqqqql");
  if (s == "youtube") return atob("GBgBAAAAAAAAAAAAAAAAAf8AH//4P//4P//8P//8P5/8P4/8f4P8f4P8P4/8P5/8P//8P//8P//4H//4Af8AAAAAAAAAAAAAAAAA");
  if (msg.id == "music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
  if (msg.id == "back") return getBackImage();
  return getNotificationImage();
}
function getMessageImageCol(msg, def) {
  return {
    // generic colors, using B2-safe colors
    "alarm": "#fff",
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff",
    // brands, according to https://www.schemecolor.com/?s (picking one for multicolored logos)
    // all dithered on B2, but we only use the color for the icons.  (Could maybe pick the closest 3-bit color for B2?)
    "bibel": "#54342c",
    "discord": "#738adb",
    "facebook": "#4267b2",
    "gmail": "#ea4335",
    "google home": "#fbbc05",
    "hangouts": "#1ba261",
    "home assistant": "#fff", // ha-blue is #41bdf5, but that's the background
    "instagram": "#dd2a7b",
    "liferando": "#ee5c00",
    "messenger": "#0078ff",
    "nina": "#e57004",
    "outlook mail": "#0072c6",
    "post & dhl": "#f2c101",
    "signal": "#00f",
    "skype": "#00aff0",
    "slack": "#e51670",
    "snapchat": "#ff0",
    "teams": "#464eb8",
    "telegram": "#0088cc",
    "threema": "#000",
    "to do": "#3999e5",
    "twitch": "#6441A4",
    "twitter": "#1da1f2",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
    "youtube": "#f00",
  }[(msg.src || "").toLowerCase()] || (def !== undefined ? def : g.theme.fg);
}

var updateLabelsInterval;

// function showMessageScroller(msg) {
//   active = "scroller";
//   var bodyFont = fontBig;
//   g.setFont(bodyFont);
//   var lines = [];
//   if (msg.title) lines = g.wrapString(msg.title, g.getWidth()-10)
//   var titleCnt = lines.length;
//   if (titleCnt) lines.push(""); // add blank line after title
//   lines = lines.concat(g.wrapString(msg.body, g.getWidth()-10),["",/*LANG*/"< Back"]);
//   E.showScroller({
//     h : g.getFontHeight(), // height of each menu item in pixels
//     c : lines.length, // number of menu items
//     // a function to draw a menu item
//     draw : function(idx, r) {
//       // FIXME: in 2v13 onwards, clearRect(r) will work fine. There's a bug in 2v12
//       g.setBgColor(idx<titleCnt ? g.theme.bg2 : g.theme.bg).
//         setColor(idx<titleCnt ? g.theme.fg2 : g.theme.fg).
//         clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
//       g.setFont(bodyFont).drawString(lines[idx], r.x, r.y);
//     }, select : function(idx) {
//       if (idx>=lines.length-2)
//         showMessage(msg.id);
//     }
//   });
//   // ensure button-press on Bangle.js 2 takes us back
//   if (process.env.HWVERSION>1) Bangle.btnWatches = [
//     setWatch(() => showMessage(msg.id), BTN1, {repeat:1,edge:"falling"})
//   ];
// }

function showMessageSettings(msg) {
  active = "settings";
  E.showMenu({
    "": { "title":/*LANG*/"Message" },
    // "< Back" : () => showMessage(msg.id),
    // /*LANG*/"View Message" : () => {
    //   showMessageScroller(msg);
    // },
    /*LANG*/"Delete": () => {
      MESSAGES = MESSAGES.filter(m => m.id != msg.id);
      saveMessages();
      checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 0, openMusic: 0 });
    },
    /*LANG*/"Mark Unread": () => {
      msg.new = true;
      saveMessages();
      checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 0, openMusic: 0 });
    },
    /*LANG*/"Mark all read": () => {
      MESSAGES.forEach(msg => msg.new = false);
      saveMessages();
      checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 0, openMusic: 0 });
    },
    /*LANG*/"Delete all messages": () => {
      E.showPrompt(/*LANG*/"Are you sure?", { title:/*LANG*/"Delete All Messages" }).then(isYes => {
        if (isYes) {
          MESSAGES = [];
          saveMessages();
        }
        checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 0, openMusic: 0 });
      });
    },
  });
}

function showMessage(msgid) {
  var msg = MESSAGES.find(m => m.id == msgid);
  if (updateLabelsInterval) {
    clearInterval(updateLabelsInterval);
    updateLabelsInterval = undefined;
  }
  if (!msg) return checkMessages({ clockIfNoMsg: 1, clockIfAllRead: 0, showMsgIfUnread: 0, openMusic: openMusic }); // go home if no message found

  active = "message";
  // Normal text message display
  var title = msg.title, titleFont = fontLarge, lines;
  if (title) {
    var w = g.getWidth() - 48;
    if (g.setFont(titleFont).stringWidth(title) > w) {
      titleFont = fontBig;
      if (settings.fontSize != 1 && g.setFont(titleFont).stringWidth(title) > w)
        titleFont = fontMedium;
    }
    if (g.setFont(titleFont).stringWidth(title) > w) {
      lines = g.wrapString(title, w);
      title = (lines.length > 2) ? lines.slice(0, 2).join("\n") + "..." : lines.join("\n");
    }
  }
  // If body of message is only two lines long w/ large font, use large font.
  var body = msg.body, bodyFont = fontLarge;
  if (body) {
    var w = g.getWidth() - 10;
    if (g.setFont(bodyFont).stringWidth(body) > w * 2) {
      bodyFont = fontBig;
      if (settings.fontSize != 1 && g.setFont(bodyFont).stringWidth(body) > w * 3)
        bodyFont = fontMedium;
    }
    if (g.setFont(bodyFont).stringWidth(body) > w) {
      lines = g.setFont(bodyFont).wrapString(msg.body, w);
      var maxLines = Math.floor((g.getHeight() - 110) / g.getFontHeight());
      body = (lines.length > maxLines) ? lines.slice(0, maxLines).join("\n") + "..." : lines.join("\n");
    }
  }

  if (msg.positive) {
    buttons.push({ fillx: 1 });
    buttons.push({
      type: "btn", src: getPosImage(), cb: () => {
        msg.new = false; saveMessages();
        cancelReloadTimeout(); // don't auto-reload to clock now
        Bangle.messageResponse(msg, true);
        checkMessages({ clockIfNoMsg: 1, clockIfAllRead: 1, showMsgIfUnread: 1, openMusic: openMusic });
      }
    });
  }
  if (msg.negative) {
    buttons.push({ fillx: 1 });
    buttons.push({
      type: "btn", src: getNegImage(), cb: () => {
        msg.new = false; saveMessages();
        cancelReloadTimeout(); // don't auto-reload to clock now
        Bangle.messageResponse(msg, false);
        checkMessages({ clockIfNoMsg: 1, clockIfAllRead: 1, showMsgIfUnread: 1, openMusic: openMusic });
      }
    });
  }


  layout = new Layout({
    type: "v", c: [
      {
        type: "h", fillx: 1, bgCol: g.theme.bg2, col: g.theme.fg2, c: [
          {
            type: "btn", src: getMessageImage(msg), col: getMessageImageCol(msg), pad: 3, cb: () => {
              cancelReloadTimeout(); // don't auto-reload to clock now
              showMessageSettings(msg);
            }
          },
          {
            type: "v", fillx: 1, c: [
              { type: "txt", font: fontSmall, label: msg.src ||/*LANG*/"Messageging", bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2, halign: 1 },
              title ? { type: "txt", font: titleFont, label: title, bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2 } : {},
            ]
          },
        ]
      },
      // {type:"txt", font:bodyFont, label:body, fillx:1, filly:1, pad:2, cb:()=>{
      //   // allow tapping to show a larger version
      //   showMessageScroller(msg);
      // } },
      { type: "h", fillx: 1, c: buttons }
    ]
  });
  g.clearRect(Bangle.appRect);
  // layout.render();
  // ensure button-press on Bangle.js 2 takes us back
  if (process.env.HWVERSION > 1) Bangle.btnWatches = [
    setWatch(goBack, BTN1, { repeat: 1, edge: "falling" })
  ];
}


/* options = {
  clockIfNoMsg : bool
  clockIfAllRead : bool
  showMsgIfUnread : bool
}
*/
function checkMessages(options) {
  options = options || {};
  // If no messages, just show 'no messages' and return
  if (!MESSAGES.length) {
    if (!options.clockIfNoMsg) return E.showPrompt(/*LANG*/"No Messages", {
      title:/*LANG*/"Messages",
      img: require("heatshrink").decompress(atob("kkk4UBrkc/4AC/tEqtACQkBqtUDg0VqAIGgoZFDYQIIM1sD1QAD4AIBhnqA4WrmAIBhc6BAWs8AIBhXOBAWz0AIC2YIC5wID1gkB1c6BAYFBEQPqBAYXBEQOqBAnDAIQaEnkAngaEEAPDFgo+IKA5iIOhCGIAFb7RqAIGgtUBA0VqobFgNVA")),
      buttons: {/*LANG*/"Ok": 1 }
    }).then(() => { load() });
    return load();
  }
  // we have >0 messages
  var newMessages = MESSAGES.filter(m => m.new && m.id != "music");
  return newMessages[0]
}

function cancelReloadTimeout() {
  if (!unreadTimeout) return;
  clearTimeout(unreadTimeout);
  unreadTimeout = undefined;
}

// ------------------------------ Messages end ---------------------------



// Clock with large digits using the "Anton" bold font

const SETTINGSFILE = "antonclk.json";


Graphics.prototype.setFontAnton = function (scale) {
  // Actual height 69 (68 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAA/gAAAAAAAAAAP/gAAAAAAAAAH//gAAAAAAAAB///gAAAAAAAAf///gAAAAAAAP////gAAAAAAD/////gAAAAAA//////gAAAAAP//////gAAAAH///////gAAAB////////gAAAf////////gAAP/////////gAD//////////AA//////////gAA/////////4AAA////////+AAAA////////gAAAA///////wAAAAA//////8AAAAAA//////AAAAAAA/////gAAAAAAA////4AAAAAAAA///+AAAAAAAAA///gAAAAAAAAA//wAAAAAAAAAA/8AAAAAAAAAAA/AAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAB///////8AAAAH////////AAAAf////////wAAA/////////4AAB/////////8AAD/////////+AAH//////////AAP//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wA//8AAAAAB//4A//wAAAAAAf/4A//gAAAAAAP/4A//gAAAAAAP/4A//gAAAAAAP/4A//wAAAAAAf/4A///////////4Af//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH//////////AAD/////////+AAB/////////8AAA/////////4AAAP////////gAAAD///////+AAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAP/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/AAAAAAAAAAA//AAAAAAAAAAA/+AAAAAAAAAAB/8AAAAAAAAAAD//////////gAH//////////gAP//////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAB/gAAD//4AAAAf/gAAP//4AAAB//gAA///4AAAH//gAB///4AAAf//gAD///4AAA///gAH///4AAD///gAP///4AAH///gAP///4AAP///gAf///4AAf///gAf///4AB////gAf///4AD////gA////4AH////gA////4Af////gA////4A/////gA//wAAB/////gA//gAAH/////gA//gAAP/////gA//gAA///8//gA//gAD///w//gA//wA////g//gA////////A//gA///////8A//gA///////4A//gAf//////wA//gAf//////gA//gAf/////+AA//gAP/////8AA//gAP/////4AA//gAH/////gAA//gAD/////AAA//gAB////8AAA//gAA////wAAA//gAAP///AAAA//gAAD//8AAAA//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAAD/wAAB//8AAAAP/wAAB///AAAA//wAAB///wAAB//wAAB///4AAD//wAAB///8AAH//wAAB///+AAP//wAAB///+AAP//wAAB////AAf//wAAB////AAf//wAAB////gAf//wAAB////gA///wAAB////gA///wAAB////gA///w//AAf//wA//4A//AAA//wA//gA//AAAf/wA//gB//gAAf/wA//gB//gAAf/wA//gD//wAA//wA//wH//8AB//wA///////////gA///////////gA///////////gA///////////gAf//////////AAf//////////AAP//////////AAP/////////+AAH/////////8AAH///+/////4AAD///+f////wAAA///8P////gAAAf//4H///+AAAAH//gB///wAAAAAP4AAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAA//wAAAAAAAAAP//wAAAAAAAAB///wAAAAAAAAf///wAAAAAAAH////wAAAAAAA/////wAAAAAAP/////wAAAAAB//////wAAAAAf//////wAAAAH///////wAAAA////////wAAAP////////wAAA///////H/wAAA//////wH/wAAA/////8AH/wAAA/////AAH/wAAA////gAAH/wAAA///4AAAH/wAAA//+AAAAH/wAAA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAH/4AAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8AAA/////+B///AAA/////+B///wAA/////+B///4AA/////+B///8AA/////+B///8AA/////+B///+AA/////+B////AA/////+B////AA/////+B////AA/////+B////gA/////+B////gA/////+B////gA/////+A////gA//gP/gAAB//wA//gf/AAAA//wA//gf/AAAAf/wA//g//AAAAf/wA//g//AAAA//wA//g//gAAA//wA//g//+AAP//wA//g////////gA//g////////gA//g////////gA//g////////gA//g////////AA//gf///////AA//gf//////+AA//gP//////+AA//gH//////8AA//gD//////4AA//gB//////wAA//gA//////AAAAAAAH////8AAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAB///////+AAAAH////////gAAAf////////4AAB/////////8AAD/////////+AAH//////////AAH//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wAf//////////4A//wAD/4AAf/4A//gAH/wAAP/4A//gAH/wAAP/4A//gAP/wAAP/4A//gAP/4AAf/4A//wAP/+AD//4A///wP//////4Af//4P//////wAf//4P//////wAf//4P//////wAf//4P//////wAP//4P//////gAP//4H//////gAH//4H//////AAH//4D/////+AAD//4D/////8AAB//4B/////4AAA//4A/////wAAAP/4AP////AAAAB/4AD///4AAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAADgA//gAAAAAAP/gA//gAAAAAH//gA//gAAAAB///gA//gAAAAP///gA//gAAAD////gA//gAAAf////gA//gAAB/////gA//gAAP/////gA//gAB//////gA//gAH//////gA//gA///////gA//gD///////gA//gf///////gA//h////////gA//n////////gA//////////gAA/////////AAAA////////wAAAA///////4AAAAA///////AAAAAA//////4AAAAAA//////AAAAAAA/////4AAAAAAA/////AAAAAAAA////8AAAAAAAA////gAAAAAAAA///+AAAAAAAAA///4AAAAAAAAA///AAAAAAAAAA//4AAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gB///wAAAAP//4H///+AAAA///8P////gAAB///+f////4AAD///+/////8AAH/////////+AAH//////////AAP//////////gAP//////////gAf//////////gAf//////////wAf//////////wAf//////////wA///////////wA//4D//wAB//4A//wB//gAA//4A//gA//gAAf/4A//gA//AAAf/4A//gA//gAAf/4A//wB//gAA//4A///P//8AH//4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////gAP//////////gAP//////////AAH//////////AAD/////////+AAD///+/////8AAB///8f////wAAAf//4P////AAAAH//wD///8AAAAA/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAB///+AA/+AAAAP////gA//wAAAf////wA//4AAB/////4A//8AAD/////8A//+AAD/////+A///AAH/////+A///AAP//////A///gAP//////A///gAf//////A///wAf//////A///wAf//////A///wAf//////A///wA///////AB//4A//4AD//AAP/4A//gAB//AAP/4A//gAA//AAP/4A//gAA/+AAP/4A//gAB/8AAP/4A//wAB/8AAf/4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH/////////+AAD/////////8AAB/////////4AAAf////////wAAAP////////AAAAB///////4AAAAAD/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("EiAnGicnJycnJycnEw=="), 78 + (scale << 8) + (1 << 16));
};

Graphics.prototype.setFontAntonSmall = function (scale) {
  // Actual height 53 (52 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAf8AAAAAAAAAAAAAAAAAAAAMAAAAAAAAD8AAAAAAAA/8AAAAAAAf/8AAAAAAH//8AAAAAB///8AAAAA////8AAAAP////8AAAD/////8AAB//////8AAf//////8AH///////4A///////+AA///////AAA//////wAAA/////8AAAA////+AAAAA////gAAAAA///4AAAAAA//8AAAAAAA//AAAAAAAA/wAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////wAAA//////8AAB//////+AAH///////gAH///////gAP///////wAf///////4Af///////4A////////8A////////8A////////8A//AAAAD/8A/8AAAAA/8A/8AAAAA/8A/8AAAAA/8A/+AAAAB/8A////////8A////////8A////////8Af///////4Af///////4AP///////wAP///////wAH///////gAD///////AAA//////8AAAP/////wAAAAAAAAAAAAAAAAAAAAAAAfwAAAAAAAA/4AAAAAAAA/4AAAAAAAB/wAAAAAAAB/wAAAAAAAD/wAAAAAAAD/gAAAAAAAH///////8AP///////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAP8AA//4AAA/8AB//4AAH/8AH//4AAP/8AP//4AA//8AP//4AB//8Af//4AD//8Af//4AP//8A///4Af//8A///4A///8A///4D///8A//AAH///8A/8AAP///8A/8AA//+/8A/8AD//8/8A/+Af//w/8A//////g/8A/////+A/8A/////8A/8Af////4A/8Af////wA/8AP////AA/8AP///+AA/8AH///8AA/8AD///wAA/8AA///AAA/8AAP/4AAA/8AAAAAAAAAAAAAAAAAAAAAAH4AAf/gAAA/4AAf/8AAD/4AAf//AAH/4AAf//gAP/4AAf//wAP/4AAf//wAf/4AAf//4Af/4AAf//4A//4AAf//8A//4AAf//8A//4AAP//8A//A/8AB/8A/8A/8AA/8A/8B/8AA/8A/8B/8AA/8A/+D//AB/8A////////8A////////8A////////8Af///////4Af///////4Af///////wAP///////gAH//9////gAD//4///+AAB//wf//4AAAP/AH//gAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAB//wAAAAAAP//wAAAAAD///wAAAAA////wAAAAH////wAAAB/////wAAAf/////wAAD//////wAA///////wAA/////h/wAA////wB/wAA///8AB/wAA///AAB/wAA//gAAB/wAA////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8A////////8AAAAAAB/wAAAAAAAB/wAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAP/4AA////4P/+AA////4P//AA////4P//gA////4P//wA////4P//wA////4P//4A////4P//4A////4P//8A////4P//8A////4P//8A/8H/AAB/8A/8H+AAA/8A/8P+AAA/8A/8P+AAA/8A/8P/gAD/8A/8P/////8A/8P/////8A/8P/////8A/8P/////4A/8H/////4A/8H/////wA/8D/////wA/8B/////gA/8A////+AA/8AP///4AAAAAB///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////wAAAf/////8AAB///////AAH///////gAP///////wAP///////wAf///////4Af///////4A////////8A////////8A////////8A/+AH/AB/8A/8AP+AA/8A/4Af+AA/8A/8Af+AA/8A/8Af/gH/8A//4f////8A//4f////8A//4f////8Af/4f////4Af/4f////4AP/4P////wAP/4P////gAH/4H////AAD/4D///+AAB/4B///4AAAP4AP//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAA/8AAAAAAAA/8AAAAAB8A/8AAAAB/8A/8AAAAf/8A/8AAAH//8A/8AAA///8A/8AAH///8A/8AA////8A/8AD////8A/8Af////8A/8B/////8A/8P/////8A/8//////8A////////AA///////AAA//////gAAA/////4AAAA/////AAAAA////4AAAAA////AAAAAA///8AAAAAA///gAAAAAA//+AAAAAAA//wAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/gD//gAAA//4P//8AAD//8f///AAH//+////gAH///////wAP///////4AP///////8Af///////8Af///////+Af///////+A////////+A//B//AB/+A/+A/+AA/+A/8Af+AA/+A/+Af+AA/+A//A//AB/+A////////+Af///////+Af///////+Af///////8Af///////8AP///////4AH///////4AH//+////wAD//+////AAA//4P//+AAAP/gH//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAfgAAA///8A/8AAB///+A//AAH////A//gAH////g//wAP////g//wAf////w//4Af////w//4A/////w//8A/////w//8A/////w//8A//gP/wA/8A/8AD/wA/8A/8AD/wAf8A/8AD/gA/8A/+AH/AB/8A////////8A////////8A////////8Af///////4Af///////4Af///////wAP///////wAH///////gAD//////+AAA//////4AAAP/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAP+AA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DhgeFB4eHh4eHh4eDw=="), 60 + (scale << 8) + (1 << 16));
};

// variables defined from settings
var secondsMode;
var secondsColoured;
var secondsWithColon;
var dateOnMain;
var dateOnSecs;
var weekDay;
var calWeek;
var upperCase;
var vectorFont;

// dynamic variables
var drawTimeout;
var queueMillis = 1000;
var secondsScreen = true;
var messageTitle = "";

var isBangle1 = (process.env.HWVERSION == 1);

//For development purposes
/*
require('Storage').writeJSON(SETTINGSFILE, {
  secondsMode: "Unlocked", // "Never", "Unlocked", "Always"
  secondsColoured: true,
  secondsWithColon: true,
  dateOnMain: "Long", // "Short", "Long", "ISO8601"
  dateOnSecs: "Year", // "No", "Year", "Weekday", LEGACY: true/false
  weekDay: true,
  calWeek: true,
  upperCase: true,
  vectorFont: true,
});
*/

// OR (also for development purposes)
/*
require('Storage').erase(SETTINGSFILE);
*/

// Load settings
function loadSettings() {
  // Helper function default setting
  function def(value, def) { return value !== undefined ? value : def; }

  var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
  secondsMode = def(settings.secondsMode, "Never");
  secondsColoured = def(settings.secondsColoured, true);
  secondsWithColon = def(settings.secondsWithColon, true);
  dateOnMain = def(settings.dateOnMain, "Long");
  dateOnSecs = def(settings.dateOnSecs, "Year");
  weekDay = def(settings.weekDay, true);
  calWeek = def(settings.calWeek, false);
  upperCase = def(settings.upperCase, true);
  vectorFont = def(settings.vectorFont, false);

  // Legacy
  if (dateOnSecs === true)
    dateOnSecs = "Year";
  if (dateOnSecs === false)
    dateOnSecs = "No";
}

// schedule a draw for the next second or minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
}

function updateState() {
  if (Bangle.isLCDOn()) {
    if ((secondsMode === "Unlocked" && !Bangle.isLocked()) || secondsMode === "Always") {
      secondsScreen = true;
      queueMillis = 1000;
    } else {
      secondsScreen = false;
      queueMillis = 60000;
    }
    messageTitle = checkMessages({ clockIfNoMsg: 0, clockIfAllRead: 0, showMsgIfUnread: 1, openMusic: false && settings.openMusic });
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
}

function isoStr(date) {
  return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
}

var calWeekBuffer = [false, false, false]; //buffer tz, date, week no (once calculated until other tz or date is requested)
function ISO8601calWeek(date) { //copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
  dateNoTime = date; dateNoTime.setHours(0, 0, 0, 0);
  if (calWeekBuffer[0] === date.getTimezoneOffset() && calWeekBuffer[1] === dateNoTime) return calWeekBuffer[2];
  calWeekBuffer[0] = date.getTimezoneOffset();
  calWeekBuffer[1] = dateNoTime;
  var tdt = new Date(date.valueOf());
  var dayn = (date.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  calWeekBuffer[2] = 1 + Math.ceil((firstThursday - tdt) / 604800000);
  return calWeekBuffer[2];
}

function doColor() {
  return !isBangle1 && !Bangle.isLocked() && secondsColoured;
}

// Actually draw the watch face
function draw() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2 - 30 - (secondsMode !== "Never" ? 24 : (vectorFont ? 12 : 0));
  g.reset();
  /* This is to mark the widget areas during development.
  g.setColor("#888")
    .fillRect(0, 0, g.getWidth(), 23)
    .fillRect(0, g.getHeight() - 23, g.getWidth(), g.getHeight()).reset();
  */
  g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24); // clear whole background (w/o widgets)
  var date = new Date(); // Actually the current date, this one is shown
  var timeStr = require("locale").time(date, 1); // Hour and minute
  var dateStr = (dateOnMain === "ISO8601" ? isoStr(date) : require("locale").date(date, (dateOnMain === "Long" ? 0 : 1)));
  var dowcwStr = "";
  if (calWeek)
    dowcwStr = " #" + ("0" + ISO8601calWeek(date)).slice(-2);
  if (weekDay)
    dowcwStr = require("locale").dow(date, calWeek ? 1 : 0) + "\n" + dowcwStr;  //weekDay e.g. Monday or weekDayShort #<calWeek> e.g. Mon #01
  else //week #01
    dowcwStr = /*LANG*/"week" + dowcwStr;
  if (upperCase)
    dowcwStr = dowcwStr.toUpperCase();

  var layout = new Layout({
    type:"v", c: [
      {type:"h", c: [
        {type:"txt", font:"27%", label:timeStr, id:"time" },
        {type:"txt", font:"5%", label:dowcwStr, id:"doc" },
      ], },
      {type:"txt", font:"10%", label:dateStr, id:"date"},
    ]
  })
  if (messageTitle[0]) {
    layout = new Layout({
      type:"v", c: [
        {type:"h", c: [
          {type:"txt", font:"27%", label:timeStr, id:"time" },
          {type:"txt", font:"5%", label:dowcwStr, id:"doc" },
        ], },
        {type:"txt", font:"10%", label:dateStr, id:"date"},
        {type:"h", c: [
          {type:"img", src:getMessageImage(messageTitle.src)},
          {type:"txt", font:"15%", label:messageTitle.title},
        ]},
        {type:"txt", font:"10%", label:messageTitle.body},
      ]
    })
  }
  g.clear();
  layout.render();

  // queue next draw
  queueDraw();
}

// Init the settings of the app
loadSettings();
// Clear the screen once, at startup
g.clear();
// Set dynamic state and perform initial drawing
updateState();
// Register hooks for LCD on/off event and screen lock on/off event
Bangle.on('lcdPower', on => {
  updateState();
});
Bangle.on('lock', on => {
  updateState();
});
// Show launcher when middle button pressed
Bangle.setUI("clock");








// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// end of file
