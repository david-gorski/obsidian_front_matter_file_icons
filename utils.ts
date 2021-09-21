import FileIconPlugin from './main';
import { ExplorerLeaf } from './@types/obsidian';

export const getIconFrom = (data: string) => {
    //TODO: see below
    //check if data is a url in which case return it as img tag
    //check if data is a string in which case just return it to display as the icon
    //check if data is a svg in which case return it as an img tag

    return data
}

export const addIconsToDOMAtStartup = (
    plugin: FileIconPlugin,
    data: Map<string, string>,
  ) => {
    const fileExplorers = plugin.app.workspace.getLeavesOfType('file-explorer');
    for (const fileExplorer of fileExplorers){
        for (const path of data.keys()){
            const fileItem = fileExplorer.view.fileItems[path];
            if (fileItem) {
                const titleEl = fileItem.titleEl;
                const titleInnerEl = fileItem.titleInnerEl;

                const iconNode = titleEl.createDiv();
                iconNode.classList.add('obsidian-icon-dg-icon');
                iconNode.innerHTML = getIconFrom(data.get(path));

                titleEl.insertBefore(iconNode, titleInnerEl);
            }
        }
    }
  }

export const removeIconsFromDOM = (
    plugin: FileIconPlugin,
    data: Map<string, string>,
  ) => {
    // this method doesnt work initially for whatever reason
    for (const path of data.keys()){
        removeFromDOM(path)
    }

  };
  

export const addIconsToDOM = (
    plugin: FileIconPlugin,
    data: Map<string, string>,
  ) => {
    // this method doesnt work initially for whatever reason
    for (const path of data.keys()){
        removeFromDOM(path)
        addToDOM(plugin, path, data.get(path))
    }

  };
  
  export const removeFromDOM = (path: string) => {
    
    //remove from file explorer
    const node = document.querySelector(`[data-path="${path}"]`);
    if (node) {
        const iconNode = node.querySelector('.obsidian-icon-dg-icon');
        if (iconNode){
            iconNode.remove();
        }
    }

    //remove from title bar
    const titleBar = document.querySelector('.view-header-title-container')
    if (titleBar) {
        const titleIcon = titleBar.querySelector('.obsidian-icon-dg-title-icon')
        if (titleIcon){
            titleIcon.remove();
        }
    }

  };
  
  export const addToDOM = (plugin: FileIconPlugin, path: string, icon: string): void => {

    // add to file explorer
    if(plugin.settings.showIconsInFileExplorer){
        const node = document.querySelector(`[data-path="${path}"]`);
        if (node){
            const titleNode = node.querySelector('.nav-file-title-content');
            if (titleNode){
                const iconNode = document.createElement('div');
                iconNode.classList.add('obsidian-icon-dg-icon');
                iconNode.innerHTML = getIconFrom(icon);
                node.insertBefore(iconNode, titleNode);
            }
        }
    }

    //add to title bar
    if(plugin.settings.showIconsInFileNameTitleBar){
        const titleBar = document.querySelector('.view-header-title-container')
        if (titleBar) {
            const title = titleBar.querySelector('.view-header-title');
            if (title) {
                const iconNode = document.createElement('div');
                iconNode.classList.add('obsidian-icon-dg-title-icon');
                iconNode.innerHTML = getIconFrom(icon)
                titleBar.insertBefore(iconNode, title)
            }
        }
    }
    
  };