
type InputBoxProps = {
  icon?: string | null;
  name: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
};

export default function InputBox({icon, name, placeholder, value, setValue}: InputBoxProps) {
    return (
        <div className="relative h-[50px] w-full">
            <input className="border border-gray-300 rounded-full shadow-lg w-full h-full text-[20px] p-4"
                type={name === "password" ? "password" : "text"}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
            />
            { icon && <i className={`bx ${icon} text-[25px] absolute top-0 translate-y-1/2 right-5`}></i>}
        </div>
    )
}