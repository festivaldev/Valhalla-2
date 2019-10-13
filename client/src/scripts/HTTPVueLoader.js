import axios from "axios";

let scopeIndex = 0;

const resolveUrl = (baseUrl, url) => {
	if (url.substr(0, 2) === './' || url.substr(0, 3) === '../') {
		return baseUrl + url;
	}
	return url;
}

const TemplateContext = class {
	component = null;
	rawHTML = "";

	constructor(component, rawHTML) {
		this.component = component;
		this.rawHTML = rawHTML;
	}
	
	get content() {
		return this.rawHTML;
	}
	set content(content) {
		this.rawHTML = content;
	}
	compile() {
		return Promise.resolve();
	}
}

const ScriptContext = class {
	component = null;
	element = null;
	module = { exports: {} };
	
	constructor(component, element) {
		this.component = component;
		this.element = element;
	}
	
	get content() {
		return this.element.textContent;
	}
	
	set content(content) {
		this.element.textContent = content;
	}
	
	compile(module) {
		let childModuleRequire = (childUrl) => {
			return HTTPVueLoader.require(resolveUrl(this.component.baseUri, childUrl));
		}
		let childLoader = (childUrl, name) => {
			return HTTPVueLoader.load(resolveUrl(this.component.baseUri, childUrl), name);
		}
		
		try {
			Function("exports", "require", "HTTPVuewLoader", "module", this.content).call(this.module.exports, this.module.exports, childModuleRequire, childLoader, this.module);
		} catch (exception) {
			console.log("i'm too lazy to implement errors");
			if (!('lineNumber' in exception)) {
				return Promise.reject(exception);
			}
			var vueFileData = responseText.replace(/\r?\n/g, '\n');
			var lineNumber = vueFileData.substr(0, vueFileData.indexOf(script)).split('\n').length + exception.lineNumber - 1;
			throw new (exception.constructor)(exception.message, url, lineNumber);
		}
		
		return Promise.resolve(this.module.exports).then(HTTPVueLoader.scriptsExportHandler.bind(this)).then(exports => {
			this.module.exports = exports;
		});
	}
}

const StyleContext = class {
	component = null;
	element = null;
	
	constructor(component, element) {
		this.component = component;
		this.element = element;
	}
	
	withBase(callback) {
		let tempBaseElement;
		
		if (this.component.baseUri) {
			tempBaseElement = document.createElement("base");
			tempBaseElement.href = this.component.baseUri;
			
			let head = this.component.head;
			head.insertBefore(tempBaseElement, head.firstChild);
		}
		
		callback.call(this);
		if (tempBaseElement) this.component.head.removeChild(tempBaseElement);
	}
	
	scopeStyles(styleElement, scopeName) {
		const process = () => {
			let sheet = styleElement.sheet;
			let rules = sheet.cssRules;
			
			for (var i = 0; i < rules.length; ++i) {
				let rule = rules[i];
				if (rule.type !== 1) continue;
				
				let scopedSelectors = [];
				rule.selectorText.split(/\s*,\s*/).forEach(selector => {
					scopedSelectors.push(scopeName + ' ' + selector);
					var segments = selector.match(/([^ :]+)(.+)?/);
					scopedSelectors.push(segments[1] + scopeName + (segments[2] || ''));
				});
				
				var scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
					sheet.deleteRule(i);
					sheet.insertRule(scopedRule, i);
			}
		}
		
		try {
			process();
		} catch (ex) {
			if (ex instanceof DOMException && ex.code === DOMException.INVALID_ACCESS_ERR) {
				styleElement.sheet.disabled = true;
				styleElement.addEventListener('load', function onStyleLoaded() {
					styleElement.removeEventListener('load', onStyleLoaded);
					setTimeout(() => {
						process();
						styleElement.sheet.disabled = false;
					});
				});
				return;
			}
			throw ex;
		}
	}
	compile() {
		var hasTemplate = this.template !== null;
		var scoped = this.element.hasAttribute('scoped');
		if (scoped) {
			if (!hasTemplate) return;
			this.element.removeAttribute('scoped');
		}
		this.withBase(() => {
			this.component.head.appendChild(this.element);
		});
		if (scoped) this.scopeStyles(this.element, '[' + this.component.getScopeId() + ']');
		return Promise.resolve();
	}
	get content() {
		return this.element.textContent;
	}
	set content(content) {
		this.withBase(() => {
			this.element.textContent = content;
		})
	}
}

const Component = class {
	baseUri = "";
	name = "";
	template = null;
	script = null;
	styles = [];
	_scopeId = "";
	
	get head() {
		return document.head;
	}
	
	get scopeId() {
		if (this._scopeId === "") {
			this._scopeId = `data-s-${(scopeIndex++).toString(36)}`;
			this.template.rootElement.setAttribute(this._scopeId, "");
		}
		
		return this._scopeId;
	}

	async load(componentUrl) {
		return await axios.get(componentUrl).then(response => {
			this.baseUri = componentUrl.substr(0, componentUrl.lastIndexOf('/') + 1);
			let htmlDocument = document.implementation.createHTMLDocument('');

			htmlDocument.body.innerHTML = response.data;

			[...htmlDocument.body.children].forEach(child => {
				switch (child.nodeName) {
					case "TEMPLATE":
						this.template = new TemplateContext(this, response.data.match(/\<template\>([\s\S]+?)\<\/template\>/gm)[0].replace(/^<template>/, "").replace(/<\/template>$/, ""));
						break;
					case "SCRIPT":
						this.script = new ScriptContext(this, child);
						break;
					case "STYLE":
						this.styles.push(new StyleContext(this, child));
						break;
					default: break;
				}
			});

			return this;
		});
	}
	async _normalizeSection(elementContext) {
		let promise;
		
		if (!elementContext || !elementContext.element.hasAttribute("src")) {
			promise = Promise.resolve(null);
		} else {
			promise = await axios.get(elementContext.element.getAttribute("src")).then(response => {
				elementContext.element.removeAttribute("src");
				return response.data;
			});
		}
		
		return promise.then(content => {
			if (elementContext && elementContext.hasAttribute("lang")) {
				let lang = elementContext.element.getAttribute("lang");
				elementContext.element.removeAttribute("lang");
				
				return HTTPVueLoader.langProcessor[lang.toLowerCase()].call(this, content ? content : elementContext.content);
			}
			
			return content;
		}).then(content => {
			if (content) elementContext.content = content;
		});
	}
	normalize() {
		return Promise.all(Array.prototype.concat(
			this._normalizeSection(this.template),
			this._normalizeSection(this.script),
			this.styles.map(style => this._normalizeSection(style))
		)).then(() => {
			return this;
		});
	}
	compile() {
		return Promise.all(Array.prototype.concat(
			this.template && this.template.compile(),
			this.script && this.script.compile(),
			this.styles.map(style => style.compile())
		)).then(() => {
			return this;
		});
	}
}



const HTTPVueLoader = {};

HTTPVueLoader.install = (Vue) => {
	Vue.mixin({
		beforeCreate: function() {
			let components = this.$options.components;
			console.log(components);
		}
	})
};

HTTPVueLoader.identity = (value) => {
	return value;
};

HTTPVueLoader.load = async (url, name, data) => {
	let component = new Component(name);
	return await component.load(url)
		.then(component => {
			return component;
		})
		.then(component => {
			return component.compile()
		})
		.then(component => {
			let exports = component.script ? component.script.module.exports : {};
			if (component.template) exports.template = component.template.content;
			if (!exports.name && component.name) exports.name = component.name;
			exports._baseUri = component.baseUri;
			
			if (exports.data && data) {
				let _data = exports.data();
				
				exports.data = () => data(_data);
			}
			
			return exports
		})
};

HTTPVueLoader.loadComponent = (url, name) => {
	return HTTPVueLoader.load(url, name);
};

HTTPVueLoader.require = (moduleName) => {
	return window[moduleName];
};

HTTPVueLoader.langProcessor = {
	html: HTTPVueLoader.identity,
	js: HTTPVueLoader.identity,
	css: HTTPVueLoader.identity
};
HTTPVueLoader.scriptsExportHandler = HTTPVueLoader.identity;

export default HTTPVueLoader;