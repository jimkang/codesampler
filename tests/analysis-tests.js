var test = require('tape');
// var jsonfile = require('jsonfile');
var createCommitSummaryAnalyzer = require('../commit-summary-analyzer').create;
// var conformAsync = require('conform-async');

test('Comment finding', function commentFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-comment',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -17,7 +17,6 @@\n import com.google.gwt.user.client.DOM;\n import com.google.gwt.user.client.Window;\n import com.google.gwt.user.client.ui.Image;\n-import com.google.gwt.user.client.ui.InlineLabel;\n import com.google.gwt.user.client.ui.RootPanel;\n \n /**\n@@ -31,9 +30,13 @@\n   public void onModuleLoad() {\n     // Creating a paper button.\n     final PaperButton button = new PaperButton();\n-    button.setIcon(\"menu\");\n-    button.setText(\"Botão\");\n+    button.setText(\"Paper button\");\n     button.setRaisedButton(true);\n+    assert button.getText().equals(\"Paper button\");\n+    final CoreIconButton coreIconBtn = new CoreIconButton();\n+    coreIconBtn.setText(\"CoreIconBtn\");\n+    coreIconBtn.setIcon(\"close\");\n+    assert coreIconBtn.getText().equals(\"CoreIconBtn\");\n \n     final PaperDialog dialog = new PaperDialog();\n     dialog.setOpened(true);\n@@ -78,10 +81,10 @@ public void onClick(final ClickEvent event) {\n       }\n     });\n \n-    final CoreIconButton coreIconBtn = new CoreIconButton();\n-    coreIconBtn.setIcon(\"folder\");\n-    coreIconBtn.setHTML(new InlineLabel(\"somelabel\").getElement().getString());\n-\n+    final CoreIconButton coreIconBtn2 = new CoreIconButton();\n+    coreIconBtn2.setIcon(\"folder\");\n+    coreIconBtn2.setText(\"somelabel\");\n+    assert coreIconBtn2.getText().equals(\"somelabel\");\n     final CoreIcon coreIcon = new CoreIcon();\n     coreIcon.setIcon(\"polymer\");\n \n@@ -98,18 +101,20 @@ public void onClick(final ClickEvent event) {\n     });\n \n     RootPanel.get().add(button);\n+    RootPanel.get().add(coreIconBtn);\n     RootPanel.get().add(checkbox);\n     RootPanel.get().add(dialog);\n     RootPanel.get().add(paperBtn);\n     RootPanel.get().add(input);\n     RootPanel.get().add(fab);\n     RootPanel.get().add(fabmini);\n-    RootPanel.get().add(coreIconBtn);\n+    RootPanel.get().add(coreIconBtn2);\n     RootPanel.get().add(coreIcon);\n     RootPanel.get().add(customPaperBtn);\n \n     // Creating uiBinder for polymer elements\n     final PolymerTest uiPolymer = new PolymerTest(\"Teste\");\n+    // FIXME: This text does not work because \"label\" is deprecated\n     RootPanel.get().add(uiPolymer);\n \n     final PaperFab fabWrapped = PaperFab.wrap(DOM.getElementById(\"rootfab\"));"'
    ]
  };

// new patches
// '@@ -0,0 +1,25 @@\n+# Exclude the .htaccess file\n+.htaccess\n+\n+# Exclude any PSD/AI source\n+*.psd\n+*.ai\n+ \n+# Exclude the build products\n+build/*\n+*.[oa]\n+\n+# Exclude OS X folder attributes\n+.DS_Store\n+ \n+# Exclude Text Files\n+*.txt\n+# Except read me\n+!README.txt\n+\n+# Exclude log files\n+*.log\n+\n+# Exclude Fonts\n+_fonts/\n+ \n'
// '@@ -63,15 +63,11 @@ pub fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {\n     let fin = 0b1 << 15;        // FIN frame\n     let opcode = 0b0001 << 8;   // text mode\n     let mask = 0b0 << 7;        // no mask\n-    let payload_len = if data.len() <= 125 {\n-        // case: 7-bit data length will suffice\n-        data.len()\n-    } else if data.len() > 2.pow(16) {\n-        // case: 64-bit data length\n-        127\n-    } else {\n-        // case: 16-bit data length\n-        126\n+\n+    let payload_len = match data.len() {\n+        l if l <= 125 => l,\n+        l if l > 2.pow(16) => 127,\n+        _ => 126,\n     } as u16;\n'

  var analyzer = createCommitSummaryAnalyzer();
  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      analysis.comments,
      [
        '// Creating a paper button.',
        '// Creating uiBinder for polymer elements',
        '// FIXME: This text does not work because \"label\" is deprecated'
      ],
      'Analysis captures comments.'
    );
  });
});

test('Function finding', function functionFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-comment',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -186,4 +186,86 @@ function validateEmailAddress (emailAddress) {\n     fb.unauth();\n   });\n \n+\n+\n+  fb.child(\'users\').once(\'value\', function(snap) {\n+    var data = snap.val();\n+\n+    console.log(\'Undecided simplelogin:2\', undecided(data, \'simplelogin:2\'));\n+  });\n+\n+  //LIKE EVENT\n+  $(\'#like\').on(\'click\', function(evt) {\n+    evt.preventDefault();\n+\n+    var likedUuid = $(\'#matchImage\').attr(\'data-uuid\').val();\n+\n+    likeUser(likedUuid);\n+  });\n+\n+  function likeUser(data, cb) {\n+    var uuid = usersFb.push(data).key();\n+    cb({ liked: uuid });\n+  }\n+\n+  //FIND USERS NOT LIKED OR DISLIKED\n+  function findUmatched(data, uuid) {\n+    var users      = _.keys(data),\n+        myLikes    = usersLikes(data[uid].data),\n+        myDislikes = usersDislikes(data[uid].data),\n+        self       = [uid];\n+\n+    return _.difference(users, self, myLikes, myDislikes);\n+  }\n+\n+  //FIND MATCHES\n+  function matches(data, uuid) {\n+    var myLikes = usersLikes(data[uuid].data);\n+\n+    return _.filter(myLikes, function(user, i) {\n+      var userData = data[user].data,\n+          userLikes = usersLikes(userData);\n+\n+      return _.includes(userLikes, uuid);\n+    });\n+  }\n+\n+  function usersLikes(userData) {\n+    if (userData && userData.likes) {\n+      return _(userData.likes)\n+        .values()\n+        .map(function(user) {\n+          return user.id;\n+        })\n+        .value();\n+    } else {\n+      return [];\n+    }\n+  }\n+\n+  function usersDislikes(userData) {\n+    if (userData && userData.dislikes) {\n+      return _(userData.dislikes)\n+        .values()\n+        .map(function(user) {\n+          return user.id;\n+        })\n+        .value();\n+    } else {\n+      return [];\n+    }\n+  }\n+\n+  $(\'#logout\').click(function() {\n+    fb.unauth();\n+    window.location.href = \'index.html\';\n+  });\n+\n+\n+  //REDIRECT FUNCTION - LOGOUT//\n+  //function goToLoginPage() {\n+    //if (fb.unauth()) {\n+      //window.location.href = \'index.html\';\n+    //}\n+  //}\n //});',
      '@@ -63,15 +63,11 @@ pub fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {\n     let fin = 0b1 << 15;        // FIN frame\n     let opcode = 0b0001 << 8;   // text mode\n     let mask = 0b0 << 7;        // no mask\n-    let payload_len = if data.len() <= 125 {\n-        // case: 7-bit data length will suffice\n-        data.len()\n-    } else if data.len() > 2.pow(16) {\n-        // case: 64-bit data length\n-        127\n-    } else {\n-        // case: 16-bit data length\n-        126\n+\n+    let payload_len = match data.len() {\n+        l if l <= 125 => l,\n+        l if l > 2.pow(16) => 127,\n+        _ => 126,\n     } as u16;\n',
      '@@ -228,6 +230,12 @@ func TransportFor(config *Config) (http.RoundTripper, error) {\n    if tlsConfig != nil {\n      transport = &http.Transport{\n        TLSClientConfig: tlsConfig,\n+       Proxy:           http.ProxyFromEnvironment,\n+       Dial: (&net.Dialer{\n+         Timeout:   30 * time.Second,\n+         KeepAlive: 30 * time.Second,\n+       }).Dial,\n+       TLSHandshakeTimeout: 10 * time.Second,\n      }\n    } else {\n      transport = http.DefaultTransport\n'
    ]
  };

  var analyzer = createCommitSummaryAnalyzer();
  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      analysis.functions,
      [
        "function validateEmailAddress (emailAddress) {",
        "function(snap) {",
        "function(evt) {",
        "function likeUser(data, cb) {",
        "function findUmatched(data, uuid) {",
        "function matches(data, uuid) {",
        "function(user, i) {",
        "function usersLikes(userData) {",
        "function(user) {",
        "function usersDislikes(userData) {",
        "function(user) {",
        "function() {",
        "function goToLoginPage() {",
        "function validateEmailAddress (emailAddress) {",
        "function(snap) {",
        "function(evt) {",
        "function likeUser(data, cb) {",
        "function findUmatched(data, uuid) {",
        "function matches(data, uuid) {",
        "function(user, i) {",
        "function usersLikes(userData) {",
        "function(user) {",
        "function usersDislikes(userData) {",
        "function(user) {",
        "function() {",
        "function goToLoginPage() {",
        'fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {',
        'func TransportFor(config *Config) (http.RoundTripper, error) {'
      ],
      'Analysis captures function declarations.'
    );
  });
});
32
