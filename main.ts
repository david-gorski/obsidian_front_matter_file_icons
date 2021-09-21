import { App, Plugin, PluginSettingTab, Setting, TAbstractFile } from 'obsidian';

import { addToDOM, removeFromDOM, addIconsToDOM, removeIconsFromDOM, addIconsToDOMAtStartup } from "./utils";

interface MyPluginSettings {
	iconFieldName: string;
	iconFiles: Map<string, string>;
	showIconsInFileExplorer: boolean;
	showIconsInFileNameTitleBar: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	iconFieldName: 'icon',
	iconFiles: new Map<string, string>(),
	showIconsInFileExplorer: true,
	showIconsInFileNameTitleBar: true
}

export default class FileIconPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		
		console.log('loading File Icon Plugin');
		await this.loadSettings();

		// 1. On initialization insert all file icons
		this.app.workspace.onLayoutReady(() => {
			this.reloadIconFileList()
			addIconsToDOMAtStartup(this, this.settings.iconFiles);
		});

		// 2. On changes to layout reinsert icons
		// unnecessary it seems and it will just impact performance
		// this.registerEvent(
		// 	this.app.workspace.on('layout-change', () => {
		// 		addIconsToDOM(this, this.settings.iconFiles);
		// 	}),
		// );
		
		// 3. On file modification, update file icon
		this.registerEvent(this.app.workspace.on("file-open", (file) => this.updateCurrentFileIcon(file)));
		this.registerEvent(this.app.vault.on("modify", (file) => this.updateCurrentFileIcon(file)));


		// 4. Have settings menu
		this.addSettingTab(new FileIconSettingsTab(this.app, this)); 
	}

	updateCurrentFileIcon(file: TAbstractFile) {
		const frontmatter = this.app.metadataCache.getCache(file.path)?.frontmatter
		if (frontmatter) {
			if (frontmatter[this.settings.iconFieldName]) {
				this.settings.iconFiles.set(file.path, frontmatter[this.settings.iconFieldName])
				removeFromDOM(file.path);
				addToDOM(this, file.path, this.settings.iconFiles.get(file.path))
			}else{
				this.settings.iconFiles.delete(file.path)
				removeFromDOM(file.path);
			}
		}else{
			this.settings.iconFiles.delete(file.path)
			removeFromDOM(file.path);
		}
	}

	reloadIconFileList(){
		this.settings.iconFiles.clear()
		const files = this.app.vault.getFiles();
		const markdownFiles = this.app.vault.getMarkdownFiles()
		for (const f of markdownFiles){
			const frontmatter = this.app.metadataCache.getFileCache(f)?.frontmatter
			if (frontmatter){
				if (frontmatter[this.settings.iconFieldName]) {
					this.settings.iconFiles.set(f.path, frontmatter[this.settings.iconFieldName])
				}
			}
		}
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		removeIconsFromDOM(this, this.settings.iconFiles)
		this.reloadIconFileList()
		addIconsToDOM(this, this.settings.iconFiles)
	}
}


class FileIconSettingsTab extends PluginSettingTab {
	plugin: FileIconPlugin;

	constructor(app: App, plugin: FileIconPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();
		
		new Setting(containerEl)
			.setName('Show Icon in File Explorer')
			.addToggle((comp) => comp
			.setValue(this.plugin.settings.showIconsInFileExplorer)
			.onChange(async (value) => {
				this.plugin.settings.showIconsInFileExplorer = value;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Show Icon in File Title Bar')
			.addToggle((comp) => comp
			.setValue(this.plugin.settings.showIconsInFileNameTitleBar)
			.onChange(async (value) => {
				this.plugin.settings.showIconsInFileNameTitleBar = value;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Front-Matter Icon Field')
			.setDesc('The name of the front-matter field that specifies the file icon')
			.addText(text => text
				.setPlaceholder('icon')
				.setValue(this.plugin.settings.iconFieldName)
				.onChange(async (value) => {
					this.plugin.settings.iconFieldName = value;
					await this.plugin.saveSettings();
				}));
	}
}