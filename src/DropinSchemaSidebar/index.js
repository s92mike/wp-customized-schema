import Sidebar from "./sidebar";
const { registerPlugin } = wp.plugins;
const { PluginDocumentSettingPanel } = wp.editPost;

registerPlugin("dropin-schema-sidebar", {
	icon: 'admin-generic',
	render: () => {
		return (
			<>
				<PluginDocumentSettingPanel
					title="Dream Schema"
				>
					<Sidebar />

				</PluginDocumentSettingPanel>
			</>
		);
	},
});
