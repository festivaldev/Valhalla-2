import GameOptions from "../../classes/GameOptions";

export default class ExampleGameOptions extends GameOptions {
	public exampleProperty: boolean = true;
	
	public serialize(): Object {
		let info: {[key: string]: any} = super.serialize();
		
		info["example-property"] = this.exampleProperty;
		
		return info;
	}
	
	public deserialize(text: string): ExampleGameOptions {
		let options: ExampleGameOptions = super.deserialize(text) as ExampleGameOptions;
		let json = JSON.parse(text);
		
		options.exampleProperty = json["example-property"]
		
		return options;
	}
}