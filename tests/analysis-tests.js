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
  // jsonfile.readFileSync()
});
