# Managing the EGAILE website

## Open your local website

Double-click `Start-EGAILE.cmd` in this folder. Keep the terminal open while reviewing. Open `http://127.0.0.1:3010` and choose Manage website in the footer, or open `/admin/login`.

Choose Open local workspace. This is a clearly labelled development shortcut on your computer. It is not your future Firebase login. Local content persists on this computer; it is not automatically shared with another person or computer.

## Change your content

Use Landing hero for the headline, introduction, button, artwork, alternative text and motion. Use Homepage sections to add supported sections, change their content, reorder them or hide them. Use Pages and services to create service, industry, article or standard pages.

New pages begin unpublished. Choose a readable URL slug and complete the title, summary and main content. The supported page template determines the layout. New component designs need technical work.

Site settings holds the menu, contact details, appearance preset and homepage search information. Use a published page path for a menu link. Adding a page and adding its menu link are separate actions.

## Save preview and publish

1. Save draft. Saving persists the change without changing the public website.
2. Open Preview draft. Select Desktop or Mobile. The preview shows the last saved content, not unsaved typing.
3. For a new page, use Preview saved page inside its editor.
4. Publish changes when the draft is ready. The workspace checks the public content version and reports whether it matches.
5. Open the website and check the page and menu yourself.

If another window has changed the content, your stale save is rejected. Export your current draft from History and recovery before reloading, then compare the changes. Do not repeatedly publish a stale version.

## Recover an incorrect edit

Open History and recovery, select an earlier published revision and restore it to the draft. Preview it, then publish deliberately. Restoring the draft alone does not change the public website. Export a JSON copy before a large editorial change. Import restores content into the editor for review; it does not publish automatically.

## Enquiries

The contact form confirms a request only after storing it. Enquiries lists the latest 100 records visible to your account. The local build may contain a request labelled Synthetic local check; it is test data, not a potential client.

Move enquiries through New, Reviewed, Contacted, Qualified or Unqualified, and Closed. The interface prevents skipping unsupported transitions. Export displayed enquiries downloads that visible set. Keep exported files private. Only an owner can delete records through this version.

If email is not configured or delivery fails, the enquiry remains in the dashboard. A failed task can be requeued after the cause is fixed; process due notifications to try again. The cloud version also has a scheduled recovery worker once it is deployed. A request receipt does not confirm an appointment or engagement.

## More people later

Once Firebase is connected, each person uses their own approved Google account through **Admin login** in the website footer. Visitors browse without logging in. In People and access, the owner grants a role to an existing Firebase Authentication account. Signing in alone does not grant staff permissions. Granting a role does not send an invitation email. Editors work on drafts, publishers can publish, and enquiry operators follow up private requests. You cannot revoke your own owner account from this screen.

The local workspace has one development owner. It does not simulate real Firebase staff accounts. Cloud memberships and revocation must be verified before other staff start using the system.

## When you need help

Record what you tried, the approximate time, the page and any safe error or receipt reference. Do not paste passwords, tokens, private client messages or service-account files into a support conversation. The repository and operating guide let a maintainer diagnose and change the system; automatic support or monitoring is not enabled by this guide.

Ordinary content changes should be possible here without coding. New payment providers, API connections, database/security changes and new page components need technical development and verification.
