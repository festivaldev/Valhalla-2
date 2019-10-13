import GameOptions from "../../classes/GameOptions";

export default class ExampleGameOptions extends GameOptions {
	public exampleProperty: boolean = true;
	
	public update(newOptions: ExampleGameOptions) {
		super.update(newOptions);
		
		this.exampleProperty = newOptions.exampleProperty
	}
	
	public serialize(includePassword: boolean = false): Object {
		let info: {[key: string]: any} = super.serialize(includePassword);
		
		info.exampleProperty = this.exampleProperty;
		
		return info;
	}
	
	public deserialize(text: string): ExampleGameOptions {
		let options: ExampleGameOptions = super.deserialize(text) as ExampleGameOptions;
		let json = JSON.parse(text);
		
		options.exampleProperty = json.exampleProperty;
		
		return options;
	}
}