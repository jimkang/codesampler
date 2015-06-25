var test = require('tape');
// var jsonfile = require('jsonfile');
var createCommitSummaryAnalyzer = require('../commit-summary-analyzer').create;
var conformAsync = require('conform-async');
var _ = require('lodash');

var mockExcerptRater = {
  rateAnalysis: function mockRateAnalysis(analysis, done) {
    // Passthrough.
    conformAsync.callBackOnNextTick(done, null, analysis);    
  }
}

test('Comment finding', function commentFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-comment',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -17,7 +17,6 @@\n import com.google.gwt.user.client.DOM;\n import com.google.gwt.user.client.Window;\n import com.google.gwt.user.client.ui.Image;\n-import com.google.gwt.user.client.ui.InlineLabel;\n import com.google.gwt.user.client.ui.RootPanel;\n \n /**\n@@ -31,9 +30,13 @@\n   public void onModuleLoad() {\n     // Creating a paper button.\n     final PaperButton button = new PaperButton();\n-    button.setIcon(\"menu\");\n-    button.setText(\"Botão\");\n+    button.setText(\"Paper button\");\n     button.setRaisedButton(true);\n+    assert button.getText().equals(\"Paper button\");\n+    final CoreIconButton coreIconBtn = new CoreIconButton();\n+    coreIconBtn.setText(\"CoreIconBtn\");\n+    coreIconBtn.setIcon(\"close\");\n+    assert coreIconBtn.getText().equals(\"CoreIconBtn\");\n \n     final PaperDialog dialog = new PaperDialog();\n     dialog.setOpened(true);\n@@ -78,10 +81,10 @@ public void onClick(final ClickEvent event) {\n       }\n     });\n \n-    final CoreIconButton coreIconBtn = new CoreIconButton();\n-    coreIconBtn.setIcon(\"folder\");\n-    coreIconBtn.setHTML(new InlineLabel(\"somelabel\").getElement().getString());\n-\n+    final CoreIconButton coreIconBtn2 = new CoreIconButton();\n+    coreIconBtn2.setIcon(\"folder\");\n+    coreIconBtn2.setText(\"somelabel\");\n+    assert coreIconBtn2.getText().equals(\"somelabel\");\n     final CoreIcon coreIcon = new CoreIcon();\n     coreIcon.setIcon(\"polymer\");\n \n@@ -98,18 +101,20 @@ public void onClick(final ClickEvent event) {\n     });\n \n     RootPanel.get().add(button);\n+    RootPanel.get().add(coreIconBtn);\n     RootPanel.get().add(checkbox);\n     RootPanel.get().add(dialog);\n     RootPanel.get().add(paperBtn);\n     RootPanel.get().add(input);\n     RootPanel.get().add(fab);\n     RootPanel.get().add(fabmini);\n-    RootPanel.get().add(coreIconBtn);\n+    RootPanel.get().add(coreIconBtn2);\n     RootPanel.get().add(coreIcon);\n     RootPanel.get().add(customPaperBtn);\n \n     // Creating uiBinder for polymer elements\n     final PolymerTest uiPolymer = new PolymerTest(\"Teste\");\n+    // FIXME: This text does not work because \"label\" is deprecated\n     RootPanel.get().add(uiPolymer);\n \n     final PaperFab fabWrapped = PaperFab.wrap(DOM.getElementById(\"rootfab\"));"',
      '@@ -1,11 +1,55 @@\n import datetime\n+from urllib2 import Request, urlopen, URLError\n+\n \n # This file should include the api call to CAISO, cron every 10 minute.  Collects realtime data which updates every 10 minutes.\n \n \n-current = datetime.datetime.now()\n-cur_str = str(current)\n \n-f = open("log_file.txt",\'a\')\n-f.write(cur_str)\n-f.close\n\ No newline at end of file\n+## DATA SOURCE DOCUMENTATION:\n+# http://www.caiso.com/Documents/SystemAccessInformation_MarketParticipants.pdf\n+\n+\n+# returned zip file naming convention:\n+#     startdate_enddate_Report Name_MktRunID_Stamp#.Zip\n+# within zip, file names:\n+#     startdate_enddate_Report Name_MktRunID_Stamp#.CSV\n+\n+# codes to use as queryname:\n+#    XML Name:          XML Data Items:       Description:\n+#    PRC_FUEL           FUEL_PRC              Daily gas price\n+#    SLD_FCST_PEAK      SYS_PEAK_MW           hrly forecast for day\n+#    SLD_FCST           SYS_FCST_DA_MW        hrly DAM forecast\n+#                       SYS_FCST_2DA_MW       hrly DAM forecast, posted 2 days before\n+#                       SYS_FCST_ACT_MW       actual demand, hrly\n+#                       SYS_FCST_5MIN_MW      operating interval RTD forecast\n+\n+\n+\n+\n+def main():\n+    current = datetime.datetime.now()\n+    current_str = str(current)\n+\n+    try:\n+        response = urlopen("http://oasis.caiso.com/oasisapi/SingleZip?queryname=SYS_FCST_ACT_MW&startdate=20150210&enddate=20150211&market_run_id=DAM&as_type=ALL&as_region=ALL")\n+        caiso_rt = response.read()\n+        print ("api response:", caiso_rt)\n+\n+        # filehandle = urlopen("http://oasis.caiso.com/mrtu-oasis/SingleZip?queryname=SYS_FCST_ACT_MW&startdate=20150210&enddate=20150211&market_run_id=DAM&as_type=ALL&as_region=ALL")\n+        # contents = filehandle.read()\n+        # print contents\n+\n+         ## TODO: check values within expected bounds, confirm timestamp is new, and update into db of dynamic data\n+\n+    except URLError:\n+        print ("Error.  CAISO api failure at",current_str)\n+\n+        f = open("log_file.txt",\'a\')\n+        f.write("\nError.  CAISO web scraper failure at: " +current_str)\n+        f.close\n+\n+\n+\n+if __name__ == "__main__":\n+    main()\n\ No newline at end of file\n',
      '@@ -00,00 +01,01 @@ +class TravelException(Exception):\n+    """Exception for problems with pathfinding"""\n+    def __init__(\n+            self,\n+            message,\n+            path=None,\n+            followed=None,\n+            traveller=None,\n+            branch=None,\n+            tick=None,\n+            lastplace=None\n+    ):\n+        """Store the message as usual, and also the optional arguments:\n+\n+        ``path``: a list of Place names to show such a path as you found\n+\n+        ``followed``: the portion of the path actually followed\n+\n+        ``traveller``: the Thing doing the travelling\n+\n+        ``branch``: branch during travel\n+\n+        ``tick``: tick at time of error (might not be the tick at the\n+        time this exception is raised)\n+\n+        ``lastplace``: where the traveller was, when the error happened\n+\n+        """\n+        self.path = path\n+        self.followed = followed\n+        self.traveller = traveller\n+        self.branch = branch\n+        self.tick = tick\n+        self.lastplace = lastplace\n+        super().__init__(message)\n'
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });
  
  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.comments, 'code'),
      [
        '"""Exception for problems with pathfinding"""',
        "// Creating a paper button.",
        "// Creating uiBinder for polymer elements",
        "// FIXME: This text does not work because \"label\" is deprecated",
        // "# This file should include the api call to CAISO, cron every 10 minute.  Collects realtime data which updates every 10 minutes.",
        // "## DATA SOURCE DOCUMENTATION:",
        // "# http://www.caiso.com/Documents/SystemAccessInformation_MarketParticipants.pdf",
        // "# returned zip file naming convention:",
        // "#     startdate_enddate_Report Name_MktRunID_Stamp#.Zip",
        // "# within zip, file names:",
        // "#     startdate_enddate_Report Name_MktRunID_Stamp#.CSV",
        // "# codes to use as queryname:",
        // "#    XML Name:          XML Data Items:       Description:",
        // "#    PRC_FUEL           FUEL_PRC              Daily gas price",
        // "#    SLD_FCST_PEAK      SYS_PEAK_MW           hrly forecast for day",
        // "#    SLD_FCST           SYS_FCST_DA_MW        hrly DAM forecast",
        // "#                       SYS_FCST_2DA_MW       hrly DAM forecast, posted 2 days before",
        // "#                       SYS_FCST_ACT_MW       actual demand, hrly",
        // "#                       SYS_FCST_5MIN_MW      operating interval RTD forecast",
        // "# filehandle = urlopen(\"http://oasis.caiso.com/mrtu-oasis/SingleZip?queryname=SYS_FCST_ACT_MW&startdate=20150210&enddate=20150211&market_run_id=DAM&as_type=ALL&as_region=ALL\")",
        // "# contents = filehandle.read()",
        // "# print contents",
        // "## TODO: check values within expected bounds, confirm timestamp is new, and update into db of dynamic data"
        // TODO: Do some matching without regular expressions so you can catch 
        // more than one of these comments.
        // '"""Store the message as usual, and also the optional arguments:\n+\n+        ``path``: a list of Place names to show such a path as you found\n+\n+        ``followed``: the portion of the path actually followed\n+\n+        ``traveller``: the Thing doing the travelling\n+\n+        ``branch``: branch during travel\n+\n+        ``tick``: tick at time of error (might not be the tick at the\n+        time this exception is raised)\n+\n+        ``lastplace``: where the traveller was, when the error happened\n+\n"""\n',        
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

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.functions, 'code'),
      [
        "function validateEmailAddress (emailAddress) {",
        "function likeUser(data, cb) {",
        "function findUmatched(data, uuid) {",
        "function matches(data, uuid) {",
        "function usersLikes(userData) {",
        "function usersDislikes(userData) {",
        "function goToLoginPage() {",
        'fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {',
        'func TransportFor(config *Config) (http.RoundTripper, error) {'
      ],
      'Analysis captures function declarations.'
    );
  });
});

test('Log finding', function logFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-log',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -186,4 +186,86 @@ function checkIt(event) {\nconsole.log(\'whut\');\n',
      '@@ -63,15 +63,11 @@ int go() {\nNSLog(veryLongVariableName);\n',
      '@@ -228,6 +230,12 @@ dump(memory);\nwizard.magic()!',
      '@@ -228,6 +230,12 @@ stream.on(\'error\', function (error) {\nstderr.write(error);\n});\n',
      '@@ -1,2 -3,4 @@      debug(something, otherthing);'
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });
  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.logStatements, 'code'),
      [
        '\'whut\'',
        'veryLongVariableName',
        'memory',
        'error',
        'something, otherthing'
      ],
      'Analysis captures log statements.'
    );
  });
});

// test('Assignment finding', function assignmentFinding(t) {
//   t.plan(2);

//   var commitSummary = {
//     sha: 'commit-with-log',
//     url: 'https://github.com/something-something',
//     patches: [
//       '@@ -186,4 +186,86 @@ var users = [];\n',
//       '@@ -63,15 +63,11 @@ var a = 1, b = 2, c = 3;\n',
//       '@@ -228,6 +230,12 @@ int n = 666; char c = \'c\';\n',
//       '@@ -1,2 -3,4 @@ if (n == 5)',
//       '@@ -228,6 +230,12 @@ x = 10000\n',
//     ]
//   };

//   var analyzer = createCommitSummaryAnalyzer();
//   analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
//     t.ok(!error, 'Analyze does not give an error.');
//     t.deepEqual(
//       analysis.assignments,
//       [
//         'var users = []',
//         'var a = 1',
//         'b = 2',
//         'c = 3',
//         'int n = 666',
//         'char c = \'c\'',
//         'x = 10000'
//       ],
//       'Analysis captures assignments.'
//     );
//   });
// });

test('Class finding', function classFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-log',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -186,4 +186,86 @@ class Entity {\n',
      '@@ -63,15 +63,11 @@ function classify() {;\n',
      '@@ -228,6 +230,12 @@ struct Vertices {\n',
      '@@ -1,2 -3,4 @@ class RubyClass\n',
      '@@ -228,6 +230,12 @@ class Beef : public Meat {\n',
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.classes, 'code'),
      [
        'class Entity {',
        'struct Vertices {',
        'class RubyClass',
        'class Beef : public Meat {'
      ],
      'Analysis captures classes.'
    );
  });
});

test('Control flow finding', function controlFlowFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-log',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -186,4 +186,86 @@ x = y;\nif (weAreCool) {\n',
      '@@ -186,4 +186,86 @@ x = y;\nif weAreCool \n',
      '@@ -63,15 +63,11 @@ +    @@ -63,15 +63,11 @@ +    if ($handle = @fopen("$filepath/addresses.txt",\'r\')) {\n+      if (is_resource($handle)) {\n+        $addresses = array();\n+        while (($buffer = fgets($handle)) !== false) {\n+          list($country, $administrative_area, $sub_administrative_area, $locality, $dependent_locality, $postal_code, $thoroughfare, $premise, $sub_premise) = explode("\t", $buffer);\n+          $fields[] = array(\n+            \'country\' => ($country == \'NULL\') ? NULL : trim($country),\n+            \'administrative_area\' => ($administrative_area == \'NULL\') ? NULL : trim($administrative_area),\n+            \'sub_administrative_area\' => ($sub_administrative_area == \'NULL\') ? NULL : trim($sub_administrative_area),\n+            \'locality\' => ($locality == \'NULL\') ? NULL : trim($locality),\n+            \'dependent_locality\' => ($dependent_locality == \'NULL\') ? NULL : trim($dependent_locality),\n+            \'postal_code\' => ($postal_code == \'NULL\') ? NULL : trim($postal_code),\n+            \'thoroughfare\' => ($thoroughfare == \'NULL\') ? NULL : trim($thoroughfare),\n+            \'premise\' => ($premise == \'NULL\') ? NULL : trim($premise),\n+            \'sub_premise\' => ($sub_premise == \'NULL\') ? NULL : trim($sub_premise),\n+          );\n+        }\n+      }\n+      fclose($handle);\n+    }\n\'',
      '@@ -228,6 +230,12 @@ function hey() {\ncommitSummaries.forEach(analysisStream.write.bind(analysisStream));\n}\n',
      '@@ -1,2 -3,4 @@                  formattedPatches = patches.map(function formatPatch(patch) {\n                    var replacement = patch.replace(/\\n/g, \'\n\');\n                    return replacement;\n                  });\n\n',
      '@@ -228,6 +230,12 @@ return _.compact(regexes.reduce(findWithRegex, []));\n',
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.controlFlow, 'code'),
      [
        'if (weAreCool) {\n',
        'if weAreCool \n',
        'if ($handle = @fopen("$filepath/addresses.txt",\'r\')) {\n',
        'if (is_resource($handle)) {\n',
        'while (($buffer = fgets($handle)) !== false) {\n',
        'commitSummaries.forEach(analysisStream.write.bind(analysisStream));\n',
        'patches.map(function formatPatch(patch) {\n',
        'regexes.reduce(findWithRegex, []));\n'
      ],
      'Analysis captures control flow statements.'
    );
  });
});

test('Preprocessor finding', function preprocessorFinding(t) {
  t.plan(2);

  var commitSummary = {
    sha: 'commit-with-log',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -186,4 +186,86 @@ x = y;\n#ifdef _DEBUG\n x = 10;\n#endif\n {\n',
      '@@ -63,15 +63,11 @@ +    @@ -63,15 +63,11 @@ +    if ($handle = @fopen("$filepath/addresses.txt",\'r\')) {\n+      if (is_resource($handle)) {\n+        $addresses = array();\n+        while (($buffer = fgets($handle)) !== false) {\n+          list($country, $administrative_area, $sub_administrative_area, $locality, $dependent_locality, $postal_code, $thoroughfare, $premise, $sub_premise) = explode("\t", $buffer);\n+          $fields[] = array(\n+            \'country\' => ($country == \'NULL\') ? NULL : trim($country),\n+            \'administrative_area\' => ($administrative_area == \'NULL\') ? NULL : trim($administrative_area),\n+            \'sub_administrative_area\' => ($sub_administrative_area == \'NULL\') ? NULL : trim($sub_administrative_area),\n+            \'locality\' => ($locality == \'NULL\') ? NULL : trim($locality),\n+            \'dependent_locality\' => ($dependent_locality == \'NULL\') ? NULL : trim($dependent_locality),\n+            \'postal_code\' => ($postal_code == \'NULL\') ? NULL : trim($postal_code),\n+            \'thoroughfare\' => ($thoroughfare == \'NULL\') ? NULL : trim($thoroughfare),\n+            \'premise\' => ($premise == \'NULL\') ? NULL : trim($premise),\n+            \'sub_premise\' => ($sub_premise == \'NULL\') ? NULL : trim($sub_premise),\n+          );\n+        }\n+      }\n+      fclose($handle);\n+    }\n\'',
      '@@ -186,4 +186,86 @@ #define __WIN2K__ 1\n',
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.deepEqual(
      _.pluck(analysis.preprocessors, 'code'),
      [
        '#ifdef _DEBUG\n',
        '#define __WIN2K__ 1\n',
      ],
      'Analysis captures preprocessor statements.'
    );
  });
});

test('Analysis stream', function testAnalysisStream(t) {
  t.plan(7);

  var commitSummaries = [
    {
      sha: 'a-one',
      url: 'http://a.one',
      patches: [
        '@@ -228,6 +230,12 @@ func TransportFor(config *Config) (http.RoundTripper, error) {\n    if tlsConfig != nil {\n      transport = &http.Transport{\n        TLSClientConfig: tlsConfig,\n+       Proxy:           http.ProxyFromEnvironment,\n+       Dial: (&net.Dialer{\n+         Timeout:   30 * time.Second,\n+         KeepAlive: 30 * time.Second,\n+       }).Dial,\n+       TLSHandshakeTimeout: 10 * time.Second,\n      }\n    } else {\n      transport = http.DefaultTransport\n'
      ]
    },
    {
      sha: 'b-two',
      url: 'http://b.two',
      patches: [
        '@@ -63,15 +63,11 @@ pub fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {\n     let fin = 0b1 << 15;        // FIN frame\n     let opcode = 0b0001 << 8;   // text mode\n     let mask = 0b0 << 7;        // no mask\n-    let payload_len = if data.len() <= 125 {\n-        // case: 7-bit data length will suffice\n-        data.len()\n-    } else if data.len() > 2.pow(16) {\n-        // case: 64-bit data length\n-        127\n-    } else {\n-        // case: 16-bit data length\n-        126\n+\n+    let payload_len = match data.len() {\n+        l if l <= 125 => l,\n+        l if l > 2.pow(16) => 127,\n+        _ => 126,\n     } as u16;\n'
      ]
    },    
    {
      sha: 'python code',
      url: 'http://c',
      patches: [
        '@@ -62,15 +63,21 @@ +    def copy(self):\n+        d = {}\n+        for att in (\n+                \'deck\',\n+                \'idx\',\n+                \'ud\',\n+                \'foreground_source\',\n+                \'foreground_color\',\n+                \'foreground_image\',\n+                \'foreground_texture\',\n+                \'background_source\',\n+                \'background_color\',\n+                \'background_image\',\n+                \'background_texture\',\n+                \'outline_color\',\n+                \'content_outline_color\',\n+                \'foreground_outline_color\',\n+                \'art_outline_color\',\n+                \'art_source\',\n+                \'art_color\',\n+                \'art_image\',\n+                \'art_texture\',\n+                \'show_art\',\n+                \'headline_text\',\n+                \'headline_markup\',\n+                \'headline_font_name\',\n+                \'headline_font_size\',\n+                \'headline_color\',\n+                \'midline_text\',\n+                \'midline_markup\',\n+                \'midline_font_name\',\n+                \'midline_font_size\',\n+                \'midline_color\',\n+                \'footer_text\',\n+                \'footer_markup\',\n+                \'footer_font_name\',\n+                \'footer_font_size\',\n+                \'footer_color\',\n+                \'text\',\n+                \'text_color\',\n+                \'markup\',\n+                \'font_name\',\n+                \'font_size\'\n+        ):\n+            v = getattr(self, att)\n+            if v is not None:\n+                d[att] = v\n+        return Card(**d)\n+'
      ]
    }
  ];

  var expectedAnalyses = [
    {
      comments: [],
      functions: [
        'func TransportFor(config *Config) (http.RoundTripper, error) {'      
      ]
    },
    {
      comments: [
       '// FIN frame',
       '// text mode',
       '// no mask',
       '// case: 7-bit data length will suffice',
       '// case: 64-bit data length',
       '// case: 16-bit data length'
      ],
      functions: [
        'fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {',
      ]
    },
    {
      comments: [],
      functions: [
        'def copy(self):'
      ]
    }
  ];

  var streamIndex = 0;

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  var analysisStream = analyzer.createAnalysisStream();

  analysisStream.on('data', function checkData(analysis) {
    t.deepEqual(
      _.pluck(analysis.comments, 'code'),
      expectedAnalyses[streamIndex].comments,
      'The correct comments are in the analysis.'
    );
    t.deepEqual(
      _.pluck(analysis.functions, 'code'),
      expectedAnalyses[streamIndex].functions,
      'The correct functions are in the analysis.'
    );
    
    streamIndex += 1;
  });

  analysisStream.on('end', function onEnd() {
    t.pass('Stream ends.');
  });

  commitSummaries.forEach(analysisStream.write.bind(analysisStream));
  analysisStream.end();
});

test('Summary property passthrough', function summaryPassthrough(t) {
  t.plan(3);

  var commitSummary = {
    sha: 'commit-with-comment',
    url: 'https://github.com/something-something',
    patches: [
      '@@ -17,7 +17,6 @@\n import com.google.gwt.user.client.DOM;\n import com.google.gwt.user.client.Window;\n import com.google.gwt.user.client.ui.Image;\n-import com.google.gwt.user.client.ui.InlineLabel;\n import com.google.gwt.user.client.ui.RootPanel;\n \n /**\n@@ -31,9 +30,13 @@\n   public void onModuleLoad() {\n     // Creating a paper button.\n     final PaperButton button = new PaperButton();\n-    button.setIcon(\"menu\");\n-    button.setText(\"Botão\");\n+    button.setText(\"Paper button\");\n     button.setRaisedButton(true);\n+    assert button.getText().equals(\"Paper button\");\n+    final CoreIconButton coreIconBtn = new CoreIconButton();\n+    coreIconBtn.setText(\"CoreIconBtn\");\n+    coreIconBtn.setIcon(\"close\");\n+    assert coreIconBtn.getText().equals(\"CoreIconBtn\");\n \n     final PaperDialog dialog = new PaperDialog();\n     dialog.setOpened(true);\n@@ -78,10 +81,10 @@ public void onClick(final ClickEvent event) {\n       }\n     });\n \n-    final CoreIconButton coreIconBtn = new CoreIconButton();\n-    coreIconBtn.setIcon(\"folder\");\n-    coreIconBtn.setHTML(new InlineLabel(\"somelabel\").getElement().getString());\n-\n+    final CoreIconButton coreIconBtn2 = new CoreIconButton();\n+    coreIconBtn2.setIcon(\"folder\");\n+    coreIconBtn2.setText(\"somelabel\");\n+    assert coreIconBtn2.getText().equals(\"somelabel\");\n     final CoreIcon coreIcon = new CoreIcon();\n     coreIcon.setIcon(\"polymer\");\n \n@@ -98,18 +101,20 @@ public void onClick(final ClickEvent event) {\n     });\n \n     RootPanel.get().add(button);\n+    RootPanel.get().add(coreIconBtn);\n     RootPanel.get().add(checkbox);\n     RootPanel.get().add(dialog);\n     RootPanel.get().add(paperBtn);\n     RootPanel.get().add(input);\n     RootPanel.get().add(fab);\n     RootPanel.get().add(fabmini);\n-    RootPanel.get().add(coreIconBtn);\n+    RootPanel.get().add(coreIconBtn2);\n     RootPanel.get().add(coreIcon);\n     RootPanel.get().add(customPaperBtn);\n \n     // Creating uiBinder for polymer elements\n     final PolymerTest uiPolymer = new PolymerTest(\"Teste\");\n+    // FIXME: This text does not work because \"label\" is deprecated\n     RootPanel.get().add(uiPolymer);\n \n     final PaperFab fabWrapped = PaperFab.wrap(DOM.getElementById(\"rootfab\"));"',
      '@@ -1,11 +1,55 @@\n import datetime\n+from urllib2 import Request, urlopen, URLError\n+\n \n # This file should include the api call to CAISO, cron every 10 minute.  Collects realtime data which updates every 10 minutes.\n \n \n-current = datetime.datetime.now()\n-cur_str = str(current)\n \n-f = open("log_file.txt",\'a\')\n-f.write(cur_str)\n-f.close\n\ No newline at end of file\n+## DATA SOURCE DOCUMENTATION:\n+# http://www.caiso.com/Documents/SystemAccessInformation_MarketParticipants.pdf\n+\n+\n+# returned zip file naming convention:\n+#     startdate_enddate_Report Name_MktRunID_Stamp#.Zip\n+# within zip, file names:\n+#     startdate_enddate_Report Name_MktRunID_Stamp#.CSV\n+\n+# codes to use as queryname:\n+#    XML Name:          XML Data Items:       Description:\n+#    PRC_FUEL           FUEL_PRC              Daily gas price\n+#    SLD_FCST_PEAK      SYS_PEAK_MW           hrly forecast for day\n+#    SLD_FCST           SYS_FCST_DA_MW        hrly DAM forecast\n+#                       SYS_FCST_2DA_MW       hrly DAM forecast, posted 2 days before\n+#                       SYS_FCST_ACT_MW       actual demand, hrly\n+#                       SYS_FCST_5MIN_MW      operating interval RTD forecast\n+\n+\n+\n+\n+def main():\n+    current = datetime.datetime.now()\n+    current_str = str(current)\n+\n+    try:\n+        response = urlopen("http://oasis.caiso.com/oasisapi/SingleZip?queryname=SYS_FCST_ACT_MW&startdate=20150210&enddate=20150211&market_run_id=DAM&as_type=ALL&as_region=ALL")\n+        caiso_rt = response.read()\n+        print ("api response:", caiso_rt)\n+\n+        # filehandle = urlopen("http://oasis.caiso.com/mrtu-oasis/SingleZip?queryname=SYS_FCST_ACT_MW&startdate=20150210&enddate=20150211&market_run_id=DAM&as_type=ALL&as_region=ALL")\n+        # contents = filehandle.read()\n+        # print contents\n+\n+         ## TODO: check values within expected bounds, confirm timestamp is new, and update into db of dynamic data\n+\n+    except URLError:\n+        print ("Error.  CAISO api failure at",current_str)\n+\n+        f = open("log_file.txt",\'a\')\n+        f.write("\nError.  CAISO web scraper failure at: " +current_str)\n+        f.close\n+\n+\n+\n+if __name__ == "__main__":\n+    main()\n\ No newline at end of file\n'
    ]
  };

  var analyzer = createCommitSummaryAnalyzer({
    excerptRater: mockExcerptRater
  });

  analyzer.analyze(commitSummary, function checkAnalysis(error, analysis) {
    t.ok(!error, 'Analyze does not give an error.');
    t.equal(analysis.sha, commitSummary.sha, 'Passes along sha.');
    t.equal(analysis.url, commitSummary.url, 'Passes along url.');
  });
});
