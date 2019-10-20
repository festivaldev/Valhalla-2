import GameOptions from "../../classes/GameOptions";

export default class UnoGameOptions extends GameOptions {
    public flags: { [flag: string]: boolean } = {};
    public variant: "classic" = "classic";
	
	public deserialize(text: string): UnoGameOptions {
		let options: UnoGameOptions = super.deserialize(text) as UnoGameOptions;
		let json = JSON.parse(text);
        
        options.flags = json.flags;
        options.variant = json.variant;
		
		return options;
	}
	
	public serialize(includePassword: boolean = false): object {
		let info: {[key: string]: any} = super.serialize(includePassword);
        
        info.flags = this.flags;
        info.variant = this.variant;
		
		return info;
	}
	
	public update(newOptions: UnoGameOptions) {
		super.update(newOptions);
        
        this.flags = newOptions.flags;
        this.variant = newOptions.variant;
	}
}